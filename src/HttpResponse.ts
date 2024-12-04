import { HttpRequest } from "./HttpRequest";

/**
 * An interface representing an HTTP response.
 *
 * Contains the response data, status, headers and other properties from a completed
 * HTTP request. The generic type parameter T defines the expected response body type.
 *
 * @typeParam T - The type of the response body
 *
 * @example
 * ```typescript
 * interface UserData {
 *   id: number;
 *   name: string;
 * }
 *
 * const request: HttpRequest = HttpRequest.newBuilder()
 *   .url("https://api.example.com/users/1")
 *   .build();
 *
 * const response: HttpResponse<UserData> = await client.send<UserData>(request);
 *
 * if (response.ok()) {
 *   const user: UserData = response.body();
 *   console.log(user.name);
 * }
 * ```
 *
 * @remarks
 * - Response body is automatically deserialized based on Content-Type
 * - Headers and query parameters are immutable
 * - Original request is accessible through {@link request} method
 * - Raw Response object available via {@link primitiveResponse}
 *
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Response|MDN Response API}
 */
export interface HttpResponse<T> {

    /**
     * Gets the HTTP status code of the response.
     *
     * @returns The numeric HTTP status code (e.g. 200, 404, 500)
     */
    statusCode(): number;

    /**
     * Gets the original request that generated this response.
     *
     * @returns The {@link HttpRequest} instance
     */
    request(): HttpRequest;

    /**
     * Gets the response headers.
     *
     * @returns The {@link Headers} object containing all response headers
     */
    headers(): Headers;

    /**
     * Gets the deserialized response body.
     *
     * @template T - The expected body type
     * @returns The response body of type T, or null if no body
     */
    body(): T;

    /**
     * Gets the final URL after following any redirects.
     *
     * @returns The response URL
     */
    url(): URL;

    /**
     * Gets the query parameters from the response URL.
     *
     * @returns The {@link URLSearchParams} containing URL query parameters
     */
    queryParams(): URLSearchParams;

    /**
     * Checks if the response status is in the successful range (200-299).
     *
     * @returns True if status is successful, false otherwise
     */
    ok(): boolean;

    /**
     * Checks if the response is the result of a redirect.
     *
     * @returns True if response was redirected, false otherwise
     */
    redirected(): boolean;

    /**
     * Gets the status text of the response.
     *
     * @returns The status text string (e.g. "OK", "Not Found")
     */
    status(): string;

    /**
     * Gets the response type as defined by the Fetch API.
     *
     * @returns The {@link ResponseType} indicating how the response was obtained
     */
    responseType(): ResponseType;

    /**
     * Gets the underlying Fetch API Response object.
     *
     * Provides access to the native Response object for low-level operations
     * or accessing features not exposed through the {@link HttpResponse} interface.
     *
     * @returns The native {@link Response} object from Fetch API
     *
     * @example
     * ```typescript
     * const response = await client.send(request);
     * const fetchResponse = response.primitiveResponse();
     * const arrayBuffer = await fetchResponse.arrayBuffer();
     * ```
     *
     * @remarks
     * Care should be taken when consuming the body from the primitive Response as it
     * can only be read once. The HttpResponse methods should be preferred when possible.
     *
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Response|MDN Response API}
     */
    primitiveResponse(): Response;
}