# http-client-for-ts

[![npm version](https://badge.fury.io/js/http-client-for-ts.svg)](https://badge.fury.io/js/http-client-for-ts)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A modern TypeScript HTTP client library inspired by Java's HttpClient design, providing an elegant builder pattern API wrapper around the Fetch API.

## Features

- 📝 Type-safe responses using TypeScript generics
- 🛠️ Fluent builder pattern API for request and client configuration
- ⚡ Modern async/await interface with Promise-based operations
- 🔄 Built-in serialization/deserialization for request and response bodies
- ⏱️ Configurable request timeouts and cancelation support
- 🔍 Query parameter handling
- 🔒 Thread-safe immutable request and response objects
- ⚡ High performance through native Fetch API
- 📦 Minimal bundle size impac
- 🌐 Complete access to underlying Fetch API capabilities

## Prerequisites

- Node.js >= 14.0.0
- TypeScript >= 4.x

## Installation

```bash
npm install http-client-for-ts
```

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

## Documentation

For more details visit the source code of each of the public API files.

## Contributing

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request
