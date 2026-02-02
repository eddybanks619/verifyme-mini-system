# VerifyMe Mini System

This project simulates a verification ingestion and data normalization system. It consists of three main microservices:

1.  **Gov Provider**: A simulated government API that provides identity data (NIN, BVN, Passport, Drivers License).
2.  **Verification Gateway**: The core service that clients interact with. It routes requests to the appropriate provider, normalizes the data, and logs the transactions.
3.  **Client App**: A simple React frontend to demonstrate the verification process.

## Project Structure

```
verifyme-mini-system/
├── app/
│   ├── gov-provider/          # Simulated 3rd party provider
│   ├── verification-gateway/  # Main API Gateway & Normalizer
│   └── client-app/            # Frontend UI
├── docker/
│   └── docker-compose.yml     # Docker orchestration
└── README.md
```

## Prerequisites

*   Docker and Docker Compose installed on your machine.

## How to Run

1.  Navigate to the `docker` directory:
    ```bash
    cd docker
    ```

2.  Start the services using Docker Compose:
    ```bash
    docker-compose up --build
    ```

3.  Access the applications:
    *   **Client App**: [http://localhost:3002](http://localhost:3002)
    *   **Verification Gateway API**: [http://localhost:3000](http://localhost:3000)
    *   **Gov Provider API**: [http://localhost:3001](http://localhost:3001)

## Test Data (Seeded)

You can use the following IDs to test the verification:

*   **NIN**: `11111111111`
*   **BVN**: `22222222222`
*   **Passport**: `A12345678`
*   **Drivers License**: `ABC123456789`

## Features Implemented

*   **Microservices Architecture**: Separate services for provider, gateway, and frontend.
*   **Provider Agnostic**: The gateway uses a provider pattern, making it easy to swap or add new providers.
*   **Data Normalization**: All identity data is normalized into a standard format before being returned to the client.
*   **Validation**: Request validation using Joi.
*   **Logging**: Verification attempts are logged to MongoDB.
*   **Security**: Basic API Key authentication between Gateway and Gov Provider.
*   **Dockerized**: Easy setup with Docker Compose.
