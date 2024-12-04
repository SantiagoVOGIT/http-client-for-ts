/**
 * Referrer policies for HTTP requests.
 *
 * @see [MDN Referrer Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Referrer-Policy)
 * @see [W3C Referrer Policy Spec](https://w3c.github.io/webappsec-referrer-policy/)
 */
export enum Referrer {
    NO_REFERRER = "no-referrer",
    NO_REFERRER_WHEN_DOWNGRADE = "no-referrer-when-downgrade",
    ORIGIN = "origin",
    ORIGIN_WHEN_CROSS_ORIGIN = "origin-when-cross-origin",
    SAME_ORIGIN = "same-origin",
    STRICT_ORIGIN = "strict-origin",
    STRICT_ORIGIN_WHEN_CROSS_ORIGIN = "strict-origin-when-cross-origin",
    UNSAFE_URL = "unsafe-url"
}