import { HttpTimeoutException } from "./HttpTimeoutException";

/**
 * Exception thrown when establishing a connection with the server times out.
 */
export class HttpConnectTimeoutException extends HttpTimeoutException {
    public constructor(message: string) {
        super(message);
    }
}