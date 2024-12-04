/**
 * Base exception class for HTTP-related errors.
 */
export class HttpException extends Error {
    public constructor(message: string) {
        super(message);
    }
}