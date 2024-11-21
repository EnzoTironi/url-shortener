# URL Shortener Service

[![CI](https://github.com/enzotironi/url-shortener/actions/workflows/ci.yml/badge.svg)](https://github.com/enzotironi/url-shortener/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A scalable, multi-tenant URL shortening service built with NX, NestJS and deployed on Kubernetes. This service provides URL shortening capabilities with user management and authentication features.

## 📋 Table of Contents

- [✨ Features](#-features)
- [🛠 Tech Stack](#-tech-stack)
- [🏗 Architecture](#-architecture)
- [📝 Prerequisites](#-prerequisites)
- [🚀 Quick Start with Docker Compose](#-quick-start-with-docker-compose)
- [🔧 Quick Start with Terraform](#-quick-start-with-terraform)
- [🔄 Testing](#-testing)
- [📄 API Documentation](#-api-documentation)
- [📊 Monitoring](#-monitoring)
- [🤝 Contributing](#-contributing)
- [📜 License](#-license)
- [💬 Support](#-support)

## ✨ Features

- URL shortening with custom short codes
- Multi-tenant support
- User authentication and authorization
- Kubernetes deployment ready
- OpenTelemetry tracing integration
- Swagger API documentation
- Health monitoring endpoints

## 🛠 Tech Stack

- **Backend Framework**: NestJS
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT-based auth
- **Container Runtime**: Docker
- **Orchestration**: Kubernetes (via Kind)
- **Infrastructure as Code**: Terraform
- **API Documentation**: OpenAPI/Swagger
- **Monitoring**: OpenTelemetry, Pino logging, Elasticsearch, Kibana
- **Testing**: Jest

## 🏗 Architecture

### System Components

- IAM Service: Handles authentication and user management
- URL Service: Manages URL shortening and redirection
- API Gateway: Routes and secures incoming requests
- PostgreSQL: Stores user and URL data
- Jaeger: Provides distributed tracing
- Elasticsearch: Handles logging aggregation
- Kibana: Provides centralized view of logs and traces

### Data Flow

1. Requests come through the API Gateway (KrakenD)
2. Authentication is handled by the IAM service
3. URL operations are processed by the URL service
4. Data is persisted in PostgreSQL databases
5. Traces are collected in Jaeger
6. Logs and traces are aggregated in Elasticsearch

## 📝 Prerequisites

### Required Tools

- Node.js (v20.11.0 recommended)
- npm
- Docker
- Kind
- Kubectl
- Terraform

## 🚀 Quick Start with Docker Compose

Quick start with Docker Compose is recommended for development.

### Steps

1. Clone and enter the repository:

```bash
git clone https://github.com/enzotironi/url-shortener.git
cd url-shortener
```

2. Copy the `.env.example` file to `.env` and set the required variables.

```bash
cp .env.example .env
```

3. Generate JWT keys for authentication:

```bash
npm install
npm run generate-jwks
```

4. Start all services with Docker Compose:

```bash
docker-compose up --build
```

5. The following services will be available:

- API Gateway: <http://localhost:8080>
- IAM Service: <http://localhost:3001>
- URL Shortener Service: <http://localhost:3002>
- Kibana: <http://localhost:5601>
- Jaeger UI: <http://localhost:16686>

6. If in development, will seed an Admin, an Test Admin and a User, for testing purposes.

7. Import the Postman collection:

   - Open Postman
   - Click "Import" button
   - Select the `postman.json` file from the project root
   - A new collection "URL Shortener API" will be added

8. Run the requests in any order, a test-suite is also available for E2E tests, and functionalities demonstration

Note: The collection is configured to automatically set the `testTenantId` and `jwtToken` variables after the respective requests.

## 🔧 Quick Start with Terraform

1. Start the development environment:

```bash
npm run k8s:deploy:all
```

2. The following services will be available:

- API Gateway: <http://localhost:8080>
- IAM Service: <http://localhost:3001>
- URL Shortener Service: <http://localhost:3002>
- Kibana: <http://localhost:5601>
- Jaeger UI: <http://localhost:16686>

3. If you want to rebuild the environment:

```bash
npm run k8s:reset
```

## 🔄 Testing

### Unit Tests

Run unit tests:

```bash
npm run test
```

### Integration Tests

Run integration tests with Postman and Docker Compose

### Making Requests to the Cluster

#### IAM Service

The IAM service is accessible at:

```bash
curl http://localhost:3001/api/health  # Health check
curl http://localhost:3001/api/auth/login -X POST \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password", "tenantId": "tenant1"}'
```

#### URL Shortener Service

The URL shortener service is accessible at:

```bash
curl http://localhost:3002/api/health  # Health check
curl http://localhost:3002/api/url -X POST \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"originalUrl": "https://example.com"}'
```

#### KrakenD API Gateway

If you deploy KrakenD, it will be accessible at:

```bash
curl http://localhost:8080/auth/token -X POST \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password", "tenantId": "tenant1"}'
```

Note: Replace `YOUR_JWT_TOKEN` with an actual JWT token obtained from the auth endpoint.

## 📄 API Documentation

Swagger API documentation is available at:

Then visit: <http://localhost:3001/api/docs>

## 📊 Monitoring

### Health Monitoring

Health monitoring endpoints are available at:

- <http://localhost:3001/api/health>
- <http://localhost:3002/api/health>

### Distributed Tracing

Distributed tracing is available through Jaeger at:

- <http://localhost:16686>

### Centralized Logging and Tracing

Centralized logging and tracing is available through Elasticsearch and Kibana at:

- <http://localhost:5601>

## 🤝 Contributing

Contributions are welcome! Please open an issue or submit a pull request.

We use Conventional Commits for commit messages. Commit using Git Commit.

## 📜 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## 💬 Support

If you need help, please open an issue or contact the maintainers.
