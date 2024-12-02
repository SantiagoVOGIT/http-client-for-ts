# http-client-for-ts

A modern TypeScript HTTP client library inspired by Java's HttpClient design, providing an elegant builder pattern API wrapper around the Fetch API.

## Features

- 🔨 Builder pattern for intuitive request/client configuration
- 🚀 Promise-based async/await API
- 🔄 Automatic request/response body serialization
-  ⚡ Configurable timeouts and abort control
- 🛡️ Type-safe responses with generics
- 🌐 Full control over CORS, caching, and credentials
- 🔗 Flexible redirect handling
- 🔍 Detailed error handling with custom exceptions

## Installation

`npm install http-client-for-ts`

## Quick Start

```typescript
import { HttpClient, HttpRequest, HttpMethod } from 'http-client-for-ts';

// Create a client
const client: HttpClient = HttpClient.newHttpClient();

// Build a request
const request: HttpRequest = HttpRequest.newBuilder()
    .url('https://jsonplaceholder.typicode.com/posts')
    .method(HttpMethod.GET)
    .header('Accept', 'application/json')
    .build();

// Example schema response
interface Post {
    id: number;
    userId: number;
    title: string;
    body: string;
}

// Send request and basic handle response
const response: HttpResponse<Post[]> = await client.send<Post[]>(request);

const posts: Post[] = response.body();
```

### Error Handling
```typescript
import { HttpTimeoutException, HttpConnectTimeoutException } from 'http-client-for-ts';

try {
    const response: HttpResponse<Post[]> = await client.send<Post[]>(request);
    // Handle response
} catch (error) {
    if (error instanceof HttpTimeoutException) {
        console.error('Request timed out');
    } else if (error instanceof HttpConnectTimeoutException) {
        console.error('Connection failed');
    } else {
        console.error('Other error:', error);
    }
}
```

### Response Handling

```typescript
import { HttpTimeoutException, HttpConnectTimeoutException } from 'http-client-for-ts';

try {
    const response: HttpResponse<Post[]> = await client.send<Post[]>(request);
    if (response.ok()) {
        console.log("Response data:", response.body())
    } else {
        console.log("Server error:", response.status());
    }
} catch (error) {
    // Handle error
}
```
## Contributing

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

[MIT License](LICENSE)
