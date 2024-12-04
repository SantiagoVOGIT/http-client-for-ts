/**
 * Cache policies for HTTP requests.
 *
 * @see [MDN Cache API](https://developer.mozilla.org/en-US/docs/Web/API/Request/cache)
 * @see [Fetch Standard - Cache Modes](https://fetch.spec.whatwg.org/#concept-request-cache-mode)
 */
export enum CachePolicy {
    DEFAULT = 'default',
    NO_STORE = 'no-store',
    RELOAD = 'reload',
    NO_CACHE = 'no-cache',
    FORCE_CACHE = 'force-cache',
    ONLY_IF_CACHED = 'only-if-cached'
}