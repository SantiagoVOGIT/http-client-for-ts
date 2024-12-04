/**
 * Defines retry behavior for failed HTTP requests.
 */
export enum RetryPolicy {

    NEVER = 'never',

    ON_NETWORK_ERROR = 'network',

    ON_SERVER_ERROR = 'server',

    ALWAYS = 'always'
}