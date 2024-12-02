import { Builder, HttpRequest } from "../HttpRequest";
import { HttpMethod } from "../util/HttpMethod";
import { HttpRequestMode } from "../util/HttpRequestMode";
import { CredentialMode } from "../util/CredentialMode";
import { CachePolicy } from "../util/CachePolicy";
import { Referrer } from "../util/Referrer";
import { HttpRequestImpl } from "./HttpRequestImpl";

/**
 * @internal
 */
export class HttpRequestBuilderImpl implements Builder {

    private _url: URL;
    private readonly _headers: Headers;
    private _timeout: number;
    private _method: HttpMethod;
    private _body: unknown;
    private _queryParams: URLSearchParams;
    private _cache: RequestCache;
    private _credentials: RequestCredentials;
    private _keepalive: boolean;
    private _mode: RequestMode;
    private _signal: AbortSignal;
    private _referrer: string;
    private _referrerPolicy: ReferrerPolicy;

    public constructor() {
        this._method = HttpMethod.GET;
        this._mode = HttpRequestMode.CORS;
        this._credentials = CredentialMode.SAME_ORIGIN;
        this._cache = CachePolicy.DEFAULT;
        this._referrerPolicy = Referrer.STRICT_ORIGIN_WHEN_CROSS_ORIGIN;
        this._keepalive = false;
        this._signal = null;
        this._headers = new Headers();
        this._timeout = null;
        this._queryParams = new URLSearchParams();
    }

    public url(url: URL | string): Builder {
        if (!url) {
            throw new TypeError("Invalid URL: " + url);
        }
        this._url = new URL(url.toString());
        this._queryParams = new URLSearchParams(this._url.search);
        return this;
    }

    public header(name: string, value: string): Builder {
        this.ensureHeaders(name, value);
        this._headers.set(name, value);
        return this;
    }

    public headers(headers: Record<string, string>): Builder {
        if (!headers) {
            throw new TypeError("Invalid headers");
        }
        Object.entries(headers).forEach(([key, value]: [string, string]): void => {
            this.ensureHeaders(key, value);
            this._headers.set(key, value);
        });
        return this;
    }

    public timeout(duration: number): Builder {
        if (!duration || typeof duration !== 'number') {
            throw new TypeError("invalid duration: " + duration)
        }
        if (duration <= 0) {
            throw new TypeError("Invalid duration range: " + duration);
        }
        this._timeout = duration;
        return this;
    }

    public method(method: HttpMethod): Builder {
        if (!method || !Object.values(HttpMethod).includes(method)) {
            throw new TypeError("Invalid HTTP method: " + method);
        }
        this._method = method;
        return this;
    }

    public body<T>(body: T): Builder {
        this._body = body;
        return this;
    }

    public queryParam(name: string, value: string): Builder {
        this.ensureQueryParams(name, value);
        this._queryParams.set(name, value);
        return this;
    }

    public queryParams(params: Record<string, string>): Builder {
        if (!params) {
            throw new TypeError("Invalid query params");
        }
        Object.entries(params).forEach(([key, value]: [string, string]): void => {
            this.ensureQueryParams(key, value);
            this._queryParams.set(key, value);
        });
        return this;
    }

    public cache(cacheMode: CachePolicy): Builder {
        this._cache = cacheMode;
        return this;
    }

    public credentials(credentials: CredentialMode): Builder {
        this._credentials = credentials;
        return this;
    }

    public keepalive(enable: boolean): Builder {
        if (!enable || typeof enable !== 'boolean') {
            throw new TypeError("Invalid keepalive mode: " + enable)
        }
        this._keepalive = enable;
        return this;
    }

    public mode(mode: HttpRequestMode): Builder {
        this._mode = mode;
        return this;
    }

    public signal(signal: AbortSignal): Builder {
        this._signal = signal;
        return this;
    }

    public referrer(referrer: string): Builder {
        this._referrer = referrer;
        return this;
    }

    public referrerPolicy(policy: Referrer): Builder {
        this._referrerPolicy = policy;
        return this;
    }

    public build(): HttpRequest {
        this.ensureRequest();
        return new HttpRequestImpl(
            this._method,
            this._url,
            this._headers,
            this._timeout,
            this._signal,
            this._queryParams,
            this._body,
            this._cache,
            this._credentials,
            this._keepalive,
            this._mode,
            this._referrer,
            this._referrerPolicy
        );
    }

    private ensureRequest(): void {
        if (!this._url) {
            throw new TypeError("Valid URL is required: " + this._url);
        }
        if (!this._method) {
            throw new TypeError("Valid HTTP method is required: " + this._method);
        }
    }

    private ensureHeaders(name: string, value: string): void {
        if (!name || typeof name !== 'string') {
            throw new TypeError("Invalid header name: " + name)
        }
        if (!value || typeof value !== 'string') {
            throw new TypeError("Invalid header value: " + value)
        }
    }

    private ensureQueryParams(name: string, value: string): void {
        if (!name || typeof name !== 'string') {
            throw new TypeError("Invalid query parameter name: " + name)
        }
        if (!value || typeof value !== 'string') {
            throw new TypeError("Invalid query parameter value: " + value)
        }
    }
}