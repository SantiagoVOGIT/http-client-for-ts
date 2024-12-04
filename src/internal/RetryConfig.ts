import { RetryPolicy } from "../config-types/RetryPolicy";
import { isFalsy, isIncluded, isType } from "./common/ValidationUtils";

/**
 * @internal
 */
export class RetryConfig {

    private readonly _retryPolicy: RetryPolicy;
    private readonly _maxAttempts: number;
    private readonly _delay: number;

    public constructor(retryPolicy: RetryPolicy, maxAttempts: number, delay: number) {
        this._retryPolicy = retryPolicy;
        this._maxAttempts = maxAttempts;
        this._delay = delay;
    }

    public static ensureRetryConfig(policy: RetryPolicy, maxAttempts: number, delay: number): void {
        if (isFalsy(policy) || !isIncluded(RetryPolicy, policy)) {
            throw new TypeError("invalid retry policy: " + policy)
        }
        if (isFalsy(maxAttempts) || !isType(maxAttempts, 'number')) {
            throw new TypeError("invalid max attempts: " + maxAttempts)
        }
        if (isFalsy(delay) || !isType(delay, 'number')) {
            throw new TypeError("invalid delay: " + policy)
        }
        if (maxAttempts <= 0) {
            throw new TypeError("Invalid max attempts range: " + maxAttempts);
        }
        if (delay < 0) {
            throw new TypeError("Invalid delay range: " + delay);
        }
    }

    public retryPolicy(): RetryPolicy {
        return this._retryPolicy;
    }

    public maxAttempts(): number {
        return this._maxAttempts;
    }

    public delay(): number {
        return this._delay;
    }
}
