import { Builder, HttpClient } from "../HttpClient";
import { Redirect } from "../util/Redirect";
import { Priority } from "../util/Priority";
import { HttpClientImpl } from "./HttpClientImpl";

/**
 * @internal
 */
export class HttpClientBuilderImpl implements Builder {

    private _connectTimeout: number;
    private _redirectPolicy: RequestRedirect;
    private _priority: RequestPriority;

    public constructor() {
        this._connectTimeout = null;
        this._redirectPolicy = Redirect.FOLLOW;
        this._priority = Priority.AUTO;
    }

    public connectTimeout(duration: number): Builder {
        if (!duration || typeof duration !== 'number') {
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
        if (!priority || !Object.values(Priority).includes(priority)) {
            throw new TypeError("Invalid priority: " + priority)
        }
        this._priority = priority;
        return this;
    }

    public build(): HttpClient {
        return new HttpClientImpl(
            this._connectTimeout,
            this._redirectPolicy,
            this._priority
        );
    }
}