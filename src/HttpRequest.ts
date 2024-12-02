import { HttpRequestBuilderImpl } from "./internal/HttpRequestBuilderImpl";
import { HttpMethod } from "./util/HttpMethod";
import { CachePolicy } from "./util/CachePolicy";
import { CredentialMode } from "./util/CredentialMode";
import { HttpRequestMode } from "./util/HttpRequestMode";
import { Referrer } from "./util/Referrer";

/**
 * An immutable representation of an HTTP request.
 *
 * This class represents the full configuration of an HTTP request including URL,
 * method, headers, body, and other settings. Instances are created using the builder pattern
 * through {@link HttpRequest.newBuilder}.
 *
 * @example
 * ```typescript
 * const request = HttpRequest.newBuilder()
 *   .url("https://api.example.com/data")
 *   .method(HttpMethod.POST)
 *   .header("Content-Type", "application/json")
 *   .body<UserData>({ id: 123 })
 *   .build();
 * ```
 *
 * @remarks
 * - All instances are immutable once created through the builder
 * - Required fields are URL and HTTP method
 * - All other fields are optional with sensible defaults
 * - Query parameters can be set via dedicated methods or included in the URL
 * - Headers and query parameters maintain insertion order
 *
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Request|MDN Request API}
 *
 * @public
 */
export abstract class HttpRequest {

    /**
     * Gets the request URL including query parameters.
     *
     * @returns The complete URL with query string
     */
    protected constructor() {
    }

    /**
     * Creates a new request builder instance.
     *
     * @returns A new {@link Builder} instance to configure the request
     *
     * @example
     * ```typescript
     * const body: ExampleData = {
     *     id: 132
     * }
     *
     * const request: HttpRequest = HttpRequest.newBuilder()
     *   .url("https://api.example.com/data")
     *   .method(HttpMethod.POST)
     *   .body<ExampleData>(body)
     *   .build();
     * ```
     *
     * @public
     */
    public static newBuilder(): Builder {
        return new HttpRequestBuilderImpl()
    }

    /**
     * Gets the request URL including query parameters.
     *
     * @returns The complete URL with query string
     *
     * @public
     */
    public abstract url(): URL;

    /**
     * Gets the request headers.
     *
     * @returns The {@link Headers} object containing all request headers
     *
     * @public
     */
    public abstract headers(): Headers;

    /**
     * Gets the request timeout in milliseconds.
     *
     * @returns The timeout duration, or null if no timeout set
     *
     * @public
     */
    public abstract timeout(): number;

    /**
     * Gets the HTTP method.
     *
     * @returns The HTTP method string (GET, POST, etc)
     *
     * @public
     */
    public abstract method(): string;

    /**
     * Gets the request body.
     *
     * @template T - The body type
     * @returns The body content, or null if no body set
     *
     * @public
     */
    public abstract body<T>(): T;

    /**
     * Gets the URL query parameters.
     *
     * @returns The URLSearchParams object containing query parameters
     *
     * @public
     */
    public abstract queryParams(): URLSearchParams;

    /**
     * Gets the cache mode.
     *
     * @returns The {@link CachePolicy} setting
     *
     * @public
     */
    public abstract cache(): RequestCache;

    /**
     * Gets the credentials mode.
     *
     * @returns The {@link CredentialMode} setting
     *
     * @public
     */
    public abstract credentials(): RequestCredentials;

    /**
     * Gets whether keepalive is enabled.
     *
     * @returns True if keepalive is enabled, false otherwise
     *
     * @public
     */
    public abstract keepalive(): boolean;

    /**
     * Gets the request mode (CORS policy).
     *
     * @returns The {@link HttpRequestMode} settin
     *
     * @public
     */
    public abstract mode(): RequestMode;

    /**
     * Gets the abort signal.
     *
     * @returns The {@link AbortSignal} instance, or null if none set
     *
     * @public
     */
    public abstract signal(): AbortSignal;

    /**
     * Gets the request referrer URL.
     *
     * @returns The referrer URL string, or empty string if none set
     *
     * @public
     */
    public abstract referrer(): string;

    /**
     * Gets the referrer policy.
     *
     * @returns The {@link Referrer} policy setting
     *
     * @public
     */
    public abstract referrerPolicy(): ReferrerPolicy;
}

export type { HttpRequest as HttpRequestType };

/**
 * A builder interface for configuring HTTP requests.
 *
 * Provides a fluent API to construct immutable {@link HttpRequest} instances with
 * customized settings for making HTTP requests.
 *
 * @public
 */
export interface Builder {

    /**
     * Sets the URL for the HTTP request.
     *
     * @param url - The target URL as string or URL object
     * @returns The builder instance for method chaining
     * @throws {TypeError} If URL is invalid
     *
     * @example
     * ```typescript
     * url("https://api.example.com/data")
     * // or
     * url(new URL("https://api.example.com/data"))
     * ```
     *
     * @public
     */
    url(url: URL | string): Builder;

    /**
     * Adds or updates a single header in the request.
     *
     * @param name - The header name
     * @param value - The header value
     * @returns The builder instance for method chaining
     * @throws {TypeError} If name or value is invalid
     *
     * @public
     */
    header(name: string, value: string): Builder;

    /**
     * Sets multiple headers at once.
     *
     * @param headers - Record of header names to values
     * @returns The builder instance for method chaining
     * @throws {TypeError} If headers object is invalid
     *
     * @public
     */
    headers(headers: Record<string, string>): Builder;

    /**
     * Sets the request timeout in milliseconds.
     *
     * @param duration - Timeout duration in ms
     * @returns The builder instance for method chaining
     * @throws {TypeError} If duration is not a positive number
     *
     * @public
     */
    timeout(duration: number): Builder;

    /**
     * Sets the HTTP method for the request.
     *
     * @param method - The {@link HttpMethod} or string method
     * @returns The builder instance for method chaining
     * @throws {TypeError} If method is invalid
     *
     * @example
     * ```typescript
     * method(HttpMethod.POST)
     * ```
     *
     * @public
     */
    method(method: HttpMethod | string): Builder;

    /**
     * Sets the request body.
     *
     * @template T - The body type
     * @param body - The body content
     * @returns The builder instance for method chaining
     *
     * @remarks
     * Supported body types:
     * - JSON-serializable objects
     * - String
     * - FormData
     * - Blob
     * - ArrayBuffer
     * - URLSearchParams
     * - ReadableStream
     *
     * @public
     */
    body<T>(body: T): Builder;

    /**
     * Adds a single query parameter.
     *
     * @param name - Parameter name
     * @param value - Parameter value
     * @returns The builder instance for method chaining
     * @throws {TypeError} If name or value is invalid
     *
     * @public
     */
    queryParam(name: string, value: string): Builder;

    /**
     * Sets multiple query parameters at once.
     *
     * @param params - Record of parameter names to values
     * @returns The builder instance for method chaining
     * @throws {TypeError} If params object is invalid
     *
     * @public
     */
    queryParams(params: Record<string, string>): Builder;

    /**
     * Sets the cache mode for the request.
     *
     * @param cacheMode - The {@link CachePolicy} to use
     * @returns The builder instance for method chaining
     *
     * @public
     */
    cache(cacheMode: CachePolicy): Builder;

    /**
     * Sets the credentials mode for the request.
     *
     * @param credentials - The {@link CredentialMode} to use
     * @returns The builder instance for method chaining
     *
     * @public
     */
    credentials(credentials: CredentialMode): Builder;

    /**
     * Sets whether to keep the connection alive.
     *
     * @param enable - True to enable keepalive
     * @returns The builder instance for method chaining
     * @throws {TypeError} If enable is not a boolean or falsy
     *
     * @public
     */
    keepalive(enable: boolean): Builder;

    /**
     * Sets the request mode (CORS policy).
     *
     * @param mode - The {@link HttpRequestMode} to use
     * @returns The builder instance for method chaining
     *
     * @public
     */
    mode(mode: HttpRequestMode): Builder;

    /**
     * Sets an abort signal to cancel the request.
     *
     * @param signal - The AbortSignal to use
     * @returns The builder instance for method chaining
     *
     * @public
     */
    signal(signal: AbortSignal): Builder;

    /**
     * Sets the request referrer.
     *
     * @param referrer - The referrer URL
     * @returns The builder instance for method chaining
     *
     * @public
     */
    referrer(referrer: string): Builder;


    /**
     * Sets the referrer policy.
     *
     * @param policy - The {@link Referrer} policy to use
     * @returns The builder instance for method chaining
     *
     * @public
     */
    referrerPolicy(policy: Referrer): Builder;

    /**
     * Creates an immutable {@link HttpRequest} instance with the configured settings.
     *
     * @returns A new configured {@link HttpRequest} instance
     * @throws {TypeError} If required fields ({@link url}, {@link method}) are not set or are invalid
     *
     * @public
     */
    build(): HttpRequest;
}
