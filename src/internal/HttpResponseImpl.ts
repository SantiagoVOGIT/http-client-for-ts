import { HttpResponse } from "../HttpResponse";
import { HttpRequest } from "../HttpRequest";

/**
 * @internal
 */
export class HttpResponseImpl<T> implements HttpResponse<T> {

    private readonly _statusCode: number;
    private readonly _request: HttpRequest;
    private readonly _headers: Headers;
    private readonly _body: T;
    private readonly _url: URL;
    private readonly _primitiveResponse: Response;

    public constructor(
        statusCode: number,
        body: T,
        headers: Headers,
        url: URL,
        request: HttpRequest,
        primitiveResponse: Response,
    ) {
        this._statusCode = statusCode;
        this._body = body;
        this._headers = headers;
        this._url = url;
        this._request = request;
        this._primitiveResponse = primitiveResponse;

        Object.freeze(this);
    }

    public statusCode(): number {
        return this._statusCode;
    }

    public request(): HttpRequest {
        return this._request;
    }

    public headers(): Headers {
        return this._headers;
    }

    public body(): T {
        return this._body;
    }

    public url(): URL {
        return this._url;
    }

    public queryParams(): URLSearchParams {
        return new URLSearchParams(this._url.search);
    }

    public ok(): boolean {
        return this.primitiveResponse().ok;
    }

    public redirected(): boolean {
        return this.primitiveResponse().redirected;
    }

    public status(): string {
        return this.primitiveResponse().statusText;
    }

    public responseType(): ResponseType {
        return this.primitiveResponse().type;
    }

    public primitiveResponse(): Response {
        return this._primitiveResponse;
    }
}