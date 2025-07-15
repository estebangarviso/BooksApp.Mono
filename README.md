# Fullstack Application with Typescript, React, NestJS and PostgreSQL

This README provides instructions on how to run a fullstack application which uses Turbo and Docker Compose. The application consists of a frontend built with React and a backend built with NestJS, along with a PostgreSQL database. The application is designed to manage a book ledger, allowing users to view, add, edit, and delete books.

## Tasks Overview

### Frontend (Client): 🔨
- Authentication login
- Develop a book list with the following features:
  - Advanced filtering by genre, publisher, author, and availability.
  - Dynamic sorting by multiple fields.
  - Server-side pagination.
  - Real-time search with debounce.
- Book registration/editing form with:
  - Reactive form validation.
  - Upload one image per book.
- View available data about a book

### Backend (Server): ✅
-  Design a modular and scalable architecture using SOLID principles.
-  Implement a JWT authentication system.
-  Develop RESTful endpoints for all ledger CRUD operations.
-  Create additional endpoints for:
-  Exporting data in CSV formats.
-  Use soft delete techniques to handle deletions.
-  Implement a logging system for auditing operations.

## Database: ✅
- Design a normalized data model that includes:
   - Appropriate relationships between tables.
   - Indexes to optimize frequent queries.
- Use transactions to ensure data integrity in critical operations.

## Testing: ✅
-  Implement unit tests for components and services in Nest.
-  Create unit tests for services and controllers in NestJS.
-  Achieve code coverage of at least 80%.

## DevOps and Deployment
- Provide a docker-compose.yml file for local deployment of the entire stack.✅

## Documatation
- Create a detailed README.md with:
  - Installation and configuration instructions. ✅
  - Application user guide. ✅
  - Description of the architecture and design decisions. ✅
- Document the API using Swagger/OpenAPI. ✅
- Provide a diagram of the system architecture. 🔨
- Include a relational model of the database (can be in image format or using tools like dbdiagram.io). 🔨

## Additional Features:
- Implement error handling on both the frontend and backend. 🌓
- Use NestJS interceptors to transform and manipulate responses. ✅

## Workflow

<p align="center">
  <img src="diagram.gif" style="height: 300px; width: auto;" />
</p>

## Prerequisites

Before proceeding, make sure you have the following installed on your machine:

- Node.js v22 (recommended)
- PNPM >=v10
- Docker
- Docker Compose

__*Important: Allow docker to create volumes in this directory. For Docker Desktop, go to Settings -> Resources -> File Sharing and add the directory where you cloned this repository.*__

## Managing the Application

This monorepo uses pnpm workspaces to manage the frontend and backend applications. You can run commands for each application using the following syntax:

```bash
pnpm --filter <package-name> <command>
# Example:
pnpm --filter @c2c/client install <package-name>
```

## Maintaining the Application

To maintain the application, you must ensure packages are up to date and dependencies are managed correctly. Use the following commands:

```bash
pnpm update
pnpm install
pnpm run test:<environment>
```

If something goes wrong, you have to roll back to a previous commit or branch. You can do this using Git commands:

```bash
git checkout <commit-hash>
# or
git checkout <branch-name>
```

Some of the packages that have conflicts with the latest versions of Node.js or PNPM are:

- `@nestjs/platform-fastify`
- `@fastify/multipart`
- `@fastify/static`
- `fastify`

Check `node_modules/<package-name>/package.json` for the specific versions that are compatible with your setup.

## Getting Started

1. Clone the repository:

    ```bash
    cd path/to/your/directory
    git clone https://github.com/BooksApp.Mono.git .
    ```

2. Start the containers to run local postgres service:

    ```bash
    docker-compose up -d
    ```

3. Read `README.md` inside Add the secrets inside `apps/(api-*|web)/env` directory and change them as per your setup.

4. Install and start monorepo packages:
    
    ```bash
    pnpm run install
    pnpm run start:(dev|prod)
    ```

5. Access the application:

    Open your web browser and go to `http://localhost:3003` to access the frontend, and `http://localhost:4004` to access the backend producer API.

## Stopping the docker compose services

To stop the docker compose services and remove the containers, run the following command:

```bash
docker-compose down
```

## Warning 

- The application is for development purposes only. Do not use it in a production event-streaming are not validating user requests and are not secure. Must implement security measures before deploying to production.

## Customization

You can customize the application by modifying the `docker-compose.yml` file and the respective Dockerfiles for the frontend and backend.

Make sure to replace the placeholder values with the actual values specific to your setup.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
