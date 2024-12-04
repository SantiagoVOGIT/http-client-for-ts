/**
 * Credentials inclusion modes.
 *
 * @see [MDN Credentials API](https://developer.mozilla.org/en-US/docs/Web/API/Request/credentials)
 * @see [Fetch Standard - Credentials Modes](https://fetch.spec.whatwg.org/#concept-request-credentials-mode)
 */
export enum CredentialMode {
    OMIT = "omit",
    SAME_ORIGIN = "same-origin",
    INCLUDE = "include"
}