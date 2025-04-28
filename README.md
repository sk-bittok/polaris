# Polaris - Livestock Management System

![Polaris Logo](/assets/7.jpg)

A comprehensive livestock management system built with Rust, Axum, PostgreSQL, and NextJS.

## Overview

Polaris helps farmers and livestock managers track animals, health records, production data, and organizational information in one centralized platform. The system supports multiple user roles (admin, manager, staff) with appropriate access control mechanisms.

## Features

- **Animal Management**: Track individual animals with breed and species information
- **Health Records**: Record and manage animal health treatments and diagnoses
- **Production Records**: Monitor livestock productivity and output metrics
- **Multi-organization Support**: Handle multiple farms or organizations
- **Role-based Access Control**: Admin, Manager, and Staff permission levels
- **Secure Authentication**: JWT-based authentication with refresh tokens
- **Flexible Configuration**: YAML-based configuration with environment variable overrides
- **Data Seeding**: Easily populate test data for development and testing

## Tech Stack

### Backend

- **Language**: Rust
- **Framework**: Axum
- **Database**: PostgreSQL with SQLx
- **Authentication**: JWT (jsonwebtoken) with RSA key pairs
- **Configuration**: YAML-based with environment overrides
- **Logging**: Tracing with customizable levels and output format

### Frontend

- **Framework**: NextJS (planned)
- **API Integration**: REST endpoints from backend

## Project Structure

```txt
.
├── config                   # Configuration files for different environments
├── migrations              # SQL database migrations
├── security                # Authentication keys and security assets
├── src                     # Source code
│   ├── bin                 # Binary executable entry point
│   ├── config              # Configuration loading code
│   ├── controllers         # Request handlers
│   ├── errors              # Error types and handling
│   ├── fixtures            # Test and seed data
│   ├── middlewares         # Request middleware components
│   ├── models              # Data models and DTOs
│   ├── seed                # Database seeding utilities
│   └── views               # Response formatters
└── tests                   # Automated tests
```

## Configuration

Polaris uses a flexible configuration system based on YAML files with environment variable overrides. Configuration files are stored in the `config` directory with environment-specific files (e.g., `development.yaml`, `production.yaml`).

### Sample Configuration

```yaml
server:
  protocol: "http"
  host: "127.0.0.1"
  port: 5150
logger:
  format: pretty
  level: debug
  directives:
    - axum
    - tower
    - config
    - polaris
db:
  url: {{ get_env(name="DATABASE_URL", default="postgresql://admin:Password@localhost:5432/livestock-db") }}
  connection_timeout: 5 # Seconds
  idle_timeout: 5 # Seconds
  max_connections: 10
  min_connections: 1
  auto_migrate: true
  recreate: false
auth:
  access:
    private_key: security/keys/dev/access_key.pem
    public_key: security/keys/dev/access_key_pub.pem
    max_age: 3600 # Seconds (One hour)
  refresh:
    private_key: security/keys/dev/refresh_key.pem
    public_key: security/keys/dev/refresh_key_pub.pem
    max_age: 604800 # Seconds (One week)
```

Environment variables can override configuration values using the pattern `APP__SECTION__KEY`. For example, to override the database URL:

```bash
APP__DB__URL=postgresql://username:password@localhost:5432/custom-db-name
```

## Getting Started

### Prerequisites

- Rust (latest stable version)
- PostgreSQL
- Docker and Docker Compose (optional)
- Node.js and npm (for frontend development)

### Setting Up Development Environment

1. **Clone the repository**

```bash
git clone https://github.com/yourusername/polaris.git
cd polaris
```

2. **Set up environment variables**

Create a `.env` file based on the template:

```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/polaris
RUST_LOG=debug
ENVIRONMENT=development
```

3. **Set up the database**

```bash
# Using Docker Compose (recommended)
docker-compose up -d db

# Or run migrations against an existing PostgreSQL instance
cargo run -- migrate
```

4. **Run the application**

```bash
cargo run
```

The API will be available at `http://localhost:5150` (default port).

### Command Line Interface

Polaris includes a CLI interface with the following commands:

```bash
# Run the application
cargo run

# Seed sample data
cargo run -- seed

# Specify environment
cargo run -- -E production
```

### Using Docker Compose

For a complete development environment:

```bash
docker-compose up
```

For tests:

```bash
docker-compose -f compose-tests.yaml up
```

## Database Migrations

Migrations are managed with SQLx and stored in the `migrations` directory. The application can automatically apply migrations based on the `auto_migrate` configuration option.

## Data Seeding

Polaris includes a data seeding mechanism to populate the database with sample data for development and testing:

```bash
cargo run -- seed
```

This command loads JSON fixture files from the `src/fixtures` directory, including:

- organizations.json
- users.json
- breeds.json
- animals.json
- productionRecords.json
- healthRecords.json

## Testing

Run tests with:

```bash
cargo test
```

Snapshot tests are implemented with `insta` and can be reviewed with:

```bash
cargo insta review
```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user and organization
- `POST /api/auth/login` - Login and get authentication tokens
- `GET /api/auth/me` - Get current user information

### Animals

- `GET /api/animals` - List all animals (with filtering options)
- `POST /api/animals` - Create a new animal
- `GET /api/animals/:id` - Get animal details
- `PUT /api/animals/:id` - Update animal information
- `DELETE /api/animals/:id` - Remove an animal

### Records

- `GET /api/records/health` - List health records
- `POST /api/records/health` - Create health record
- `GET /api/records/production` - List production records
- `POST /api/records/production` - Create production record

### Administration

- `POST /api/admin/users` - Create users (admin only)
- `GET /api/admin/roles` - List available roles

## Security

Polaris uses RS256 JSON Web Tokens for authentication with separate access and refresh tokens:

- Access tokens expire after 1 hour (configurable)
- Refresh tokens expire after 1 week (configurable)
- RSA key pairs are used for signing and verification

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contact

Simon Bittok - <bittokks@gmail.com>

Project Link: [https://github.com/sk-bittok/polaris](https://github.com/sk-bittok/polaris)