import { Builder, HttpClient } from "../HttpClient";
import { Redirect } from "../req-types/Redirect";
import { Priority } from "../req-types/Priority";
import { HttpClientImpl } from "./HttpClientImpl";
import { RetryConfig } from "./RetryConfig";
import { RetryPolicy } from "../config-types/RetryPolicy";
import { isFalsy, isIncluded, isType } from "./common/ValidationUtils";

/**
 * @internal
 */
export class HttpClientBuilderImpl implements Builder {

    private _connectTimeout: number;
    private _redirectPolicy: RequestRedirect;
    private _priority: RequestPriority;
    private _retry: RetryConfig;

    public constructor() {
        this._connectTimeout = null;
        this._redirectPolicy = Redirect.FOLLOW;
        this._priority = Priority.AUTO;
        this._retry = new RetryConfig(RetryPolicy.NEVER, null, null)
    }

    public connectTimeout(duration: number): Builder {
        if (isFalsy(duration) || !isType(duration, 'number')) {
            throw new TypeError("invalid duration: " + duration)
        }
        if (duration <= 0) {
            throw new TypeError("Invalid duration range: " + duration);
        }
        this._connectTimeout = duration;
        return this;
    }

    public followRedirects(policy: Redirect): Builder {
        this._redirectPolicy = policy;
        return this;
    }

    public priority(priority: Priority): Builder {
        if (isFalsy(priority) || !isIncluded(Priority, priority)) {
            throw new TypeError("Invalid priority: " + priority)
        }
        this._priority = priority;
        return this;
    }

    public retry(policy: RetryPolicy, maxAttempts: number, delay: number): Builder {
        RetryConfig.ensureRetryConfig(policy, maxAttempts, delay)
        this._retry = new RetryConfig(policy, maxAttempts, delay);
        return this;
    }

    public build(): HttpClient {
        return new HttpClientImpl(
            this._connectTimeout,
            this._redirectPolicy,
            this._priority,
            this._retry
        );
    }
}