import { HttpRequestType } from "../HttpRequest";
import { HttpMethod } from "../req-types/HttpMethod";

/**
 * @internal
 */
export class HttpRequestImpl implements HttpRequestType {

    private readonly _url: URL;
    private readonly _headers: Headers;
    private readonly _timeout: number;
    private readonly _method: HttpMethod;
    private readonly _body: unknown
    private readonly _queryParams: URLSearchParams;
    private readonly _cache: RequestCache;
    private readonly _credentials: RequestCredentials;
    private readonly _keepalive: boolean;
    private readonly _mode: RequestMode;
    private readonly _signal: AbortSignal;
    private readonly _referrer: string;
    private readonly _referrerPolicy: ReferrerPolicy;

    public constructor(
        method: HttpMethod,
        url: URL,
        headers: Headers,
        timeout: number,
        signal: AbortSignal,
        queryParams: URLSearchParams,
        body: unknown,
        cache: RequestCache,
        credentials: RequestCredentials,
        keepalive: boolean,
        mode: RequestMode,
        referrer: string,
        referrerPolicy: ReferrerPolicy
    ) {
        this._method = method;
        this._url = url;
        this._headers = headers;
        this._timeout = timeout;
        this._signal = signal;
        this._queryParams = queryParams;
        this._body = body;
        this._cache = cache;
        this._credentials = credentials;
        this._keepalive = keepalive;
        this._mode = mode;
        this._referrer = referrer;
        this._referrerPolicy = referrerPolicy;

        Object.freeze(this);
    }

    public url(): URL {
        const url: URL = this._url;
        url.search = this._queryParams.toString();
        return url;
    }

    public headers(): Headers {
        return this._headers;
    }

    public timeout(): number {
        return this._timeout;
    }

    public method(): string {
        return this._method;
    }

    public body<T>(): T {
        return this._body as T;
    }

    public queryParams(): URLSearchParams {
        return this._queryParams;
    }

    public cache(): RequestCache {
        return this._cache;
    }

    public credentials(): RequestCredentials {
        return this._credentials;
    }

    public keepalive(): boolean {
        return this._keepalive;
    }

    public mode(): RequestMode {
        return this._mode;
    }

    public signal(): AbortSignal {
        return this._signal;
    }

    public referrer(): string {
        return this._referrer;
    }

    public referrerPolicy(): ReferrerPolicy {
        return this._referrerPolicy;
    }
}