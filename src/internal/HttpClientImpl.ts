import { HttpClientType } from "../HttpClient";
import { HttpRequest } from "../HttpRequest";
import { HttpResponse } from "../HttpResponse";
import { HttpResponseImpl } from "./HttpResponseImpl";
import { HttpConnectTimeoutException } from "../error/HttpConnectTimeoutException";
import { HttpTimeoutException } from "../error/HttpTimeoutException";
import { RetryConfig } from "./RetryConfig";
import { RetryPolicy } from "../config-types/RetryPolicy";
import { isFalsy, isType } from "./common/ValidationUtils";

/**
 * @internal
 */
export class HttpClientImpl implements HttpClientType {

    private readonly _connectTimeout: number;
    private readonly _redirectPolicy: RequestRedirect;
    private readonly _priority: RequestPriority;
    private readonly _controller: AbortController;
    private readonly _retry: RetryConfig;

    public readonly JSON_MIME_TYPES: string[] = ['application/json', 'application/problem+json', 'application/ld+json'];
    public readonly TEXT_MIME_TYPES: string[] =
        ['text/plain', 'text/html', 'text/css', 'text/javascript', 'application/javascript', 'application/ecmascript', 'application/xml', 'text/xml'];
    public readonly BINARY_MIME_TYPES: string[] = ['application/json', 'application/problem+json', 'application/ld+json'];
    public readonly FORM_MIME_TYPES: string[] = ['multipart/form-data', 'application/x-www-form-urlencoded'];
    private readonly HTTP_NO_CONTENT: number = 204;

    public constructor(
        connectTimeout: number,
        redirectPolicy: RequestRedirect,
        priority: RequestPriority,
        retry: RetryConfig
    ) {
        this._connectTimeout = connectTimeout;
        this._redirectPolicy = redirectPolicy;
        this._priority = priority;
        this._retry = retry;
        this._controller = new AbortController();

        Object.freeze(this);
    }

    public connectTimeout(): number {
        return this._connectTimeout;
    }

    public followRedirects(): RequestRedirect {
        return this._redirectPolicy;
    }

    public priority(): RequestPriority {
        return this._priority;
    }

    public async send<T>(request: HttpRequest): Promise<HttpResponse<T>> {
        if (isFalsy(request)) {
            throw new TypeError("Invalid request");
        }
        return this._retry.retryPolicy() !== RetryPolicy.NEVER
            ? this.executeWithRetry<T>(request)
            : this.executeRequest<T>(request);
    }

    public abort(): void {
        this._controller.abort();
    }

    private async executeRequest<T>(request: HttpRequest): Promise<HttpResponse<T>> {
        try {
            const requestInit: RequestInit = this.createRequestInit(request);
            const timeoutId: number = this.setupTimeout(request);

            const response: Response = await fetch(request.url(), requestInit);
            this.clearTimeout(timeoutId);

            return await this.createHttpResponse<T>(response, request);
        } catch (error) {
            throw this.handleRequestError(error);
        }
    }

    private async executeWithRetry<T>(request: HttpRequest): Promise<HttpResponse<T>> {
        let attempts: number = 0;
        let lastError: Error;

        while (attempts < this._retry.maxAttempts()) {
            try {
                const response: HttpResponse<T> = await this.executeRequest<T>(request);

                if (this.shouldRetryForStatus(response.statusCode())) {
                    attempts++;
                    await this.delay();
                    continue;
                }

                return response;
            } catch (error) {
                lastError = this.handleRequestError(error);

                if (this.shouldRetryForError(lastError)) {
                    attempts++;
                    await this.delay();
                    continue;
                }
                throw lastError;
            }
        }
        throw lastError || new Error('Max retry attempts reached');
    }

    private createRequestInit(request: HttpRequest): RequestInit {
        return Object.freeze({
            method: request.method(),
            headers: request.headers(),
            body: this.serializeBody(request.body()),
            mode: request.mode(),
            credentials: request.credentials(),
            cache: request.cache(),
            redirect: this._redirectPolicy,
            referrer: request.referrer(),
            referrerPolicy: request.referrerPolicy(),
            keepalive: request.keepalive(),
            signal: this.getAbortSignal(request),
            priority: this._priority,
        });
    }

    private setupTimeout(request: HttpRequest): number {
        const timeout: number = request.timeout() || this._connectTimeout;
        if (isFalsy(timeout)) return null;

        return setTimeout((): void => this.abort(), timeout);
    }

    private clearTimeout(timeoutId: number): void {
        if (timeoutId) clearTimeout(timeoutId);
    }

    private getAbortSignal(request: HttpRequest): AbortSignal {
        return request.signal() || this._controller.signal;
    }

    private async createHttpResponse<T>(response: Response, request: HttpRequest): Promise<HttpResponse<T>> {
        const body: Awaited<T> = await this.deserializeBody<T>(response);
        return new HttpResponseImpl<T>(
            response.status,
            body,
            response.headers,
            new URL(response.url),
            request,
            response
        );
    }

    private serializeBody<T>(body: T): BodyInit {
        if (isFalsy(body)) return null;
        if (this.isDirectlySerializable(body)) return body as BodyInit;

        return this.serializeToJson(body);
    }

    private isDirectlySerializable(body: unknown): boolean {
        return (
            body instanceof Blob ||
            body instanceof ArrayBuffer ||
            body instanceof FormData ||
            body instanceof URLSearchParams ||
            body instanceof ReadableStream ||
            isType(body, 'string') ||
            ArrayBuffer.isView(body)
        );
    }

    private serializeToJson<T>(body: T): string {
        try {
            return JSON.stringify(body);
        } catch (error) {
            const errorMessage: string = error instanceof Error ? error.message : String(error);
            throw new TypeError(`Failed to serialize request body: ${errorMessage}`);
        }
    }

    private async deserializeBody<T>(response: Response): Promise<T> {
        if (this.hasNoContent(response)) return null as T;

        const mimeType: string = this.getMimeType(response);
        try {
            return await this.deserializeByMimeType<T>(response, mimeType);
        } catch (error) {
            const errorMessage: string = error instanceof Error ? error.message : String(error);
            throw new TypeError(
                `Failed to deserialize response body with content-type '${mimeType}': ${errorMessage}`
            );
        }
    }

    private hasNoContent(response: Response): boolean {
        return response.status === this.HTTP_NO_CONTENT || response.body === null;
    }

    private getMimeType(response: Response): string {
        const contentType: string = response.headers.get('Content-Type') || '';
        return contentType.split(';')[0].toLowerCase().trim();
    }

    private async deserializeByMimeType<T>(response: Response, mimeType: string): Promise<T> {
        if (this.JSON_MIME_TYPES.includes(mimeType)) {
            return await response.json();
        }
        if (this.TEXT_MIME_TYPES.includes(mimeType)) {
            return await response.text() as unknown as T;
        }
        if (this.BINARY_MIME_TYPES.includes(mimeType)) {
            return await response.blob() as unknown as T;
        }
        if (this.FORM_MIME_TYPES.includes(mimeType)) {
            return await response.formData() as unknown as T;
        }

        return this.attemptJsonFallback<T>(response);
    }

    private async attemptJsonFallback<T>(response: Response): Promise<T> {
        try {
            return await response.json();
        } catch {
            return await response.text() as unknown as T;
        }
    }

    private handleRequestError(error: unknown): Error {
        if (isFalsy(error)) {
            return new Error("Unknown error occurred");
        }
        if (this.isNetworkError(error)) {
            return new HttpConnectTimeoutException("Connection could not be established with the server");
        }
        if (this.isTimeoutError(error)) {
            return new HttpTimeoutException("Request exceeded configured timeout duration");
        }
        return error instanceof Error ? error : new Error("An unexpected error has occurred: " + String(error));
    }

    private isNetworkError(error: unknown): boolean {
        return error instanceof TypeError &&
            error.message.toLowerCase().includes('failed to fetch');
    }

    private isTimeoutError(error: unknown): boolean {
        return error instanceof Error && error.name === 'AbortError';
    }

    private shouldRetryForStatus(status: number): boolean {
        const policy: RetryPolicy = this._retry.retryPolicy();
        switch (policy) {
            case RetryPolicy.NEVER:
                return false;
            case RetryPolicy.ON_SERVER_ERROR:
                return status >= 500;
            case RetryPolicy.ALWAYS:
                return status !== 200;
            default:
                return false;
        }
    }

    private shouldRetryForError(error: Error): boolean {
        const policy: RetryPolicy = this._retry.retryPolicy();
        switch (policy) {
            case RetryPolicy.NEVER:
                return false;
            case RetryPolicy.ON_NETWORK_ERROR:
            case RetryPolicy.ALWAYS:
                return error instanceof HttpConnectTimeoutException;
            default:
                return false;
        }
    }

    private async delay(): Promise<void> {
        await new Promise(resolve => setTimeout(resolve, this._retry.delay()));
    }
}