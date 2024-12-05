import { HttpClient } from "./HttpClient";
import { RetryPolicy } from "./config-types/RetryPolicy";
import { HttpRequest } from "./HttpRequest";
import { HttpResponse } from "./HttpResponse";

export class Main {
    public static async main(): Promise<void> {
        // Create client with retry configuration
        const client: HttpClient = HttpClient.newBuilder()
            .retry(RetryPolicy.ON_SERVER_ERROR, 2, 3000) // Retry 3 times with 1 second delay on 5xx errors
            .build();

        // Test endpoint that returns 500 error
        const request: HttpRequest = HttpRequest.newBuilder()
            .url('https://httpstat.us/500') // This service returns different HTTP status codes
            .header('Accept', 'application/json')
            .build();

        console.time('Request Duration');
        try {
            const response: HttpResponse<any> = await client.send(request);
            console.timeEnd('Request Duration');
            console.log('Response:', {
                status: response.statusCode(),
                body: response.body()
            });
        } catch (error) {
            console.timeEnd('Request Duration');
            console.error('Error after retries:', error);
        }
    }
}

Main.main().catch(console.error);