/**
 * Redirect handling policies.
 *
 * @see [MDN Redirect Mode](https://developer.mozilla.org/en-US/docs/Web/API/Request/redirect)
 * @see [Fetch Standard - Redirect Modes](https://fetch.spec.whatwg.org/#concept-request-redirect-mode)
 */
export enum Redirect {
    FOLLOW = 'follow',
    ERROR = 'error',
    MANUAL = 'manual'
}
