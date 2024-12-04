/**
 * HTTP methods.
 *
 * @see [MDN HTTP Methods](https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods)
 * @see [RFC 9110 - HTTP Methods](https://www.rfc-editor.org/rfc/rfc9110.html#name-methods)
 */
export enum HttpMethod {
    GET = 'GET',
    POST = 'POST',
    PUT = 'PUT',
    DELETE = 'DELETE',
    HEAD = 'HEAD',
    OPTIONS = 'OPTIONS',
    TRACE = 'TRACE',
    PATCH = 'PATCH',
    CONNECT = 'CONNECT'
}