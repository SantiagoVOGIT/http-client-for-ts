import { HttpClientType } from "../HttpClient";
import { Redirect } from "../util/Redirect";
import { Priority } from "../util/Priority";
import { HttpRequest } from "../HttpRequest";
import { HttpResponse } from "../HttpResponse";
import { HttpResponseImpl } from "./HttpResponseImpl";
import { HttpConnectTimeoutException } from "../error/HttpConnectTimeoutException";
import { HttpTimeoutException } from "../error/HttpTimeoutException";

/**
 * @internal
 */
export class HttpClientImpl implements HttpClientType {

    private readonly _connectTimeout: number;
    private readonly _redirectPolicy: RequestRedirect;
    private readonly _priority: RequestPriority;
    private readonly _controller: AbortController;

    public constructor(
        connectTimeout: number,
        redirectPolicy: Redirect,
        priority: Priority
    ) {
        this._connectTimeout = connectTimeout;
        this._redirectPolicy = redirectPolicy;
        this._priority = priority;
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
        if (!request) {
            throw new TypeError("Invalid request");
        }
        try {
            const init: Readonly<RequestInit> = this.createRequestInit(request);
            const timeoutId: number = this.setupTimeout(init, request);

            const response: Response = await fetch(request.url(), init);

            if (timeoutId) {
                clearTimeout(timeoutId);
            }

            return await this.createHttpResponse<T>(response, request);
        } catch (error) {
            throw this.handleRequestError(error);
        }
    }

    public abort(): void {
        this._controller.abort();
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
            signal: this.createAbortSignal(request),
            priority: this._priority,
        });
    }

    private setupTimeout(init: RequestInit, request: HttpRequest): number {
        const timeout: number = request.timeout() || this._connectTimeout;
        if (!timeout) {
            return null;
        }
        return setTimeout((): void => {
            this.abort();
        }, timeout);
    }

    private createAbortSignal(request: HttpRequest): AbortSignal {
        return request.signal() || this._controller.signal;
    }

    private async createHttpResponse<T>(response: Response, request: HttpRequest): Promise<HttpResponse<T>> {
        const body: T = await this.deserializeBody<T>(response);
        return new HttpResponseImpl<T>(
            response.status,
            body,
            response.headers,
            new URL(response.url),
            request,
            response,
            null
        );
    }

    private serializeBody<T>(body: T): BodyInit {
        if (!body) {
            return null;
        }
        if (
            body instanceof Blob ||
            body instanceof ArrayBuffer ||
            body instanceof FormData ||
            body instanceof URLSearchParams ||
            body instanceof ReadableStream ||
            typeof body === 'string' ||
            ArrayBuffer.isView(body)
        ) {
            return body as BodyInit;
        }
        try {
            return JSON.stringify(body);
        } catch (error) {
            const errorMessage: string = error instanceof Error ? error.message : String(error);
            throw new TypeError(`Failed to serialize request body: ${errorMessage}`);
        }
    }

    private async deserializeBody<T>(response: Response): Promise<T> {
        if (response.status === 204 || response.body === null) {
            return null as T;
        }

        const contentType: string = response.headers.get('Content-Type') || '';
        const mimeType: string = contentType.split(';')[0].toLowerCase().trim();

        try {
            switch (mimeType) {
                case 'application/json':
                case 'application/problem+json':
                case 'application/ld+json':
                    return await response.json();

                case 'text/plain':
                case 'text/html':
                case 'text/css':
                case 'text/javascript':
                case 'application/javascript':
                case 'application/ecmascript':
                case 'application/xml':
                case 'text/xml':
                    return await response.text() as unknown as T;

                case 'application/octet-stream':
                case 'application/pdf':
                case 'image/jpeg':
                case 'image/png':
                case 'image/gif':
                case 'audio/mpeg':
                case 'video/mp4':
                    return await response.blob() as unknown as T;

                case 'multipart/form-data':
                case 'application/x-www-form-urlencoded':
                    return await response.formData() as unknown as T;

                default:
                    try {
                        return await response.json();
                    } catch {
                        return await response.text() as unknown as T;
                    }
            }
        } catch (error) {
            const errorMessage: string = error instanceof Error ? error.message : String(error);
            throw new TypeError(`Failed to deserialize response body with content-type '${contentType}': ${errorMessage}`);
        }
    }

    private handleRequestError(error: unknown): Error {
        if (!error) {
            return new Error("Unknown error occurred");
        }
        if (error instanceof TypeError) {
            const message: string = error.message.toLowerCase();
            if (message.includes('failed to fetch')) {
                return new HttpConnectTimeoutException("Connection could not be established with the server");
            }
        }
        if (error instanceof Error) {
            if (error.name === 'AbortError') {
                return new HttpTimeoutException("Request exceeded configured timeout duration");
            }
            return error;
        }
        return new Error("An unexpected error has occurred: " + String(error));
    }
}