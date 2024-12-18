import { HttpException } from "./HttpException";

/**
 * Exception thrown when a request exceeds its configured timeout duration.
 */
export class HttpTimeoutException extends HttpException {

    public constructor(message: string) {
        super(message);
    }
}