import { HttpClientBuilderImpl } from "./internal/HttpClientBuilderImpl";
import { HttpRequest } from "./HttpRequest";
import { HttpResponse } from "./HttpResponse";
import { Redirect } from "./req-types/Redirect";
import { Priority } from "./req-types/Priority";
import { RetryPolicy } from "./config-types/RetryPolicy";

/**
 * A high-level HTTP client for making web requests.
 *
 * Provides an elegant builder-based API for configuring and sending HTTP requests,
 * inspired by Java's HttpClient design. Wraps the Fetch API with a more
 * developer-friendly interface.
 *
 * @example
 * ```typescript
 * // Create a client with default settings
 * const client: HttpClient = HttpClient.newHttpClient();
 *
 * // Or customize using the builder
 * const customClient: HttpClient = HttpClient.newBuilder()
 *   .connectTimeout(5000)
 *   .followRedirects(Redirect.MANUAL)
 *   .priority(Priority.HIGH)
 *   .build();
 * ```
 *
 * @remarks
 * This class cannot be instantiated directly. Use the static factory methods
 * {@link newHttpClient} or {@link newBuilder} to create instances.
 *
 * The client is immutable once created. All configuration must be done through
 * the builder at creation time.
 *
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API MDN Fetch API} Base implementation
 * @see {@link https://docs.oracle.com/en/java/javase/11/docs/api/java.net.http/java/net/http/HttpClient.html Java HttpClient} API design inspiration
 */
export abstract class HttpClient {

    protected constructor() {
    }

    /**
     * Creates a new HTTP client with default settings.
     *
     * @returns A new {@link HttpClient} instance
     *
     * @example
     * ```typescript
     * const client = HttpClient.newHttpClient();
     * ```
     *
     * @remarks
     * Default settings include:
     * - {@link followRedirects}: `follow`
     * - {@link priority}: `auto`
     * - {@link connectTimeout}: `null`
     *
     * @see These defaults are based on those used by the {@link https://developer.mozilla.org/en-US/docs/Web/API/RequestInit|Fetch API}
     */
    public static newHttpClient(): HttpClient {
        return this.newBuilder().build();
    }

    /**
     * Returns a builder for creating customized HTTP clients.
     *
     * @returns A new {@link Builder} instance to configure
     *
     * @example
     * ```typescript
     * const client = HttpClient.newBuilder()
     *   .connectTimeout(5000)
     *   .followRedirects(Redirect.MANUAL)
     *   .priority(Priority.HIGH)
     *   .build();
     * ```
     */
    public static newBuilder(): Builder {
        return new HttpClientBuilderImpl();
    }

    /**
     * Gets the connection timeout in milliseconds for this client.
     *
     * @returns The connection timeout duration in milliseconds, or `null` if no timeout is set
     */
    public abstract connectTimeout(): number;

    /**
     * Gets the redirect policy for this client.
     *
     * @returns The {@link RequestRedirect} policy for handling HTTP redirects
     */
    public abstract followRedirects(): RequestRedirect;

    /**
     * Gets the configured request priority for this client.
     *
     * @returns The {@link RequestPriority} level for HTTP requests
     */
    public abstract priority(): RequestPriority;

    /**
     * Sends an HTTP request and returns a Promise that completes with the response.
     *
     * @example
     * ```typescript
     * const request: HttpRequest = HttpRequest.newBuilder()
     *   .url("https://api.example.com/data")
     *   .method(HttpMethod.GET)
     *   .build();
     *
     * const response: HttpResponse<ExampleData> = await client.send<ExampleData>(request);
     * const data: ExampleData = response.body();
     * ```
     *
     * @param request - The {@link HttpRequest} to send
     * @returns A Promise that resolves to an {@link HttpResponse} containing the response data
     *
     * @throws {TypeError} When the request parameter is  {@link https://developer.mozilla.org/en-US/docs/Glossary/Falsy|falsy}
     * @throws {HttpConnectTimeoutException} When the connection cannot be established with the server
     * @throws {HttpTimeoutException} When the request exceeds the configured timeout duration
     * @throws {TypeError} When the response body cannot be deserialized according to its content typ
     *
     * @typeParam T - The expected type of the response body
     *
     * @remarks
     * Response body deserialization follows these rules:
     * - application/json: Parsed as JSON
     * - text/*: Returned as string
     * - application/octet-stream: Returned as Blob
     * - multipart/form-data: Returned as FormData
     * - Other types: Attempts JSON parse, falls back to text
     *
     * Request behavior:
     * - Honors both client-level and request-level timeout settings
     * - Follows configured redirect policy ({@link Redirect})
     * - Uses specified request priority ({@link Priority})
     * - Can be aborted via {@link abort} method
     */
    public abstract send<T>(request: HttpRequest): Promise<HttpResponse<T>>;

    /**
     * Cancels all pending requests from this client.
     * Any ongoing request will be aborted and its promise will reject.
     */
    public abstract abort(): void;

}

/**
 * @internal
 */
export type { HttpClient as HttpClientType };

/**
 * A builder interface for configuring an {@link HttpClient} instance.
 *
 * Provides a fluent API to customize HTTP client settings before creation.
 * The builder ensures all settings are properly validated and defaults are applied.
 *
 * @example
 * ```typescript
 * const client = HttpClient.newBuilder()
 *   .connectTimeout(5000)
 *   .followRedirects(Redirect.MANUAL)
 *   .priority(Priority.HIGH)
 *   .build();
 * ```
 *
 * @remarks
 * All builder methods validate their inputs and throw {@link TypeError} for invalid values.
 * Settings not explicitly configured will use sensible defaults based on the Fetch API.
 * The builder is intended to be used through {@link HttpClient.newBuilder}.
 */
export interface Builder {

    /**
     * Configures the connection timeout for all requests made by this client.
     * The timeout represents the maximum time to establish a connection.
     *
     * @param duration - Time in milliseconds to wait for connection establishment
     * @returns The builder instance for method chaining
     * @throws {TypeError} If duration is less than 0 or not a number
     */
    connectTimeout(duration: number): Builder;

    /**
     * Sets how redirects should be handled for all requests made by this client.
     * Aligns with the Fetch API redirect policies.
     *
     * @param policy - The {@link Redirect} policy to use
     * @returns The builder instance for method chaining
     */
    followRedirects(policy: Redirect): Builder;

    /**
     * Sets the priority hint for resource loading.
     * Matches browser's resource prioritization mechanism.
     *
     * @param priority - The {@link Priority} to indicate loading priority
     * @returns The builder instance for method chaining
     * @throws {TypeError} If priority is not one of the valid enum values
     */

    priority(priority: Priority): Builder;

    /**
     * Configures the retry behavior for failed HTTP requests.
     *
     * @param policy - The {@link RetryPolicy} that determines when to retry requests
     * @param maxAttempts - Maximum number of retry attempts (must be > 0)
     * @param delay - Time in milliseconds to wait between retries (must be >= 0)
     * @returns The builder instance for method chaining
     * @throws {TypeError} If any parameters are invalid:
     *   - Invalid retry policy
     *   - maxAttempts <= 0
     *   - delay < 0
     *
     * @example
     * ```typescript
     * const client = HttpClient.newBuilder()
     *   .retry(RetryPolicy.ON_SERVER_ERROR, 3, 1000) // Retry 3 times with 1s delay on 5xx errors
     *   .build();
     * ```
     *
     * @remarks
     * - The first request is not counted as an attempt
     * - Retries use exponential backoff with the specified delay as base
     * - Network timeouts trigger retries according to the policy
     * - Cancellation via abort signal stops retry attempts
     */
    retry(policy: RetryPolicy, maxAttempts: number, delay: number): Builder

    /**
     * Creates an immutable HttpClient instance with all configured settings.
     *
     * @returns A new configured HttpClient instance
     */
    build(): HttpClient;
}