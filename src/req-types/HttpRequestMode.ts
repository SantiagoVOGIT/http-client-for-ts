/**
 * CORS modes for requests.
 *
 * @see [MDN Request Mode](https://developer.mozilla.org/en-US/docs/Web/API/Request/mode)
 * @see [Fetch Standard - CORS Protocol](https://fetch.spec.whatwg.org/#cors-protocol)
 */
export enum HttpRequestMode {
    NAVIGATE = 'navigate',
    SAME_ORIGIN = 'same-origin',
    NO_CORS = 'no-cors',
    CORS = 'cors'
}