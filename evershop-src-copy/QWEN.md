# EverShop - Modern TypeScript eCommerce Platform

## Project Overview

EverShop is a modern, TypeScript-first eCommerce platform built with GraphQL and React. Designed for developers, it offers essential commerce features in a modular, fully customizable architecture. The platform is built with Express, React, and PostgreSQL, providing a solid foundation for building tailored shopping experiences.

### Key Technologies
- **Backend**: Express.js, GraphQL
- **Frontend**: React
- **Database**: PostgreSQL (with custom query builder)
- **Language**: TypeScript/JavaScript
- **Module System**: Modular architecture with extensions
- **File Storage**: Supports S3, Azure, and local storage

### Architecture
- **Monorepo Structure**: Uses npm workspaces with packages and extensions directories
- **Core Modules**: auth, base, catalog, checkout, cms, customer, graphql, oms (order management system), payment methods (paypal, stripe, cod), promotion, setting, tax
- **Extension System**: Modular design that allows for custom extensions
- **Build System**: Uses SWC for compilation and TypeScript

## Project Structure
```
packages/
├── create-evershop-app
├── evershop (main application)
└── postgres-query-builder
extensions/ (modular extensions like agegate, s3_file_storage, google_login, etc.)
config/
src/
├── bin (build, dev, start, install scripts)
├── components
├── lib
├── modules (core functionality)
└── types
```

## Building and Running

### Installation
1. **Prerequisites**: Node.js, PostgreSQL
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Setup database**:
   ```bash
   npm run setup
   ```
4. **Development server**:
   ```bash
   npm run dev
   ```
5. **Production build**:
   ```bash
   npm run build
   npm run start
   ```

### Docker Installation
```bash
curl -sSL https://raw.githubusercontent.com/evershopcommerce/evershop/main/docker-compose.yml > docker-compose.yml
docker-compose up -d
```

### Available Scripts
- `npm run dev` - Start development server
- `npm run start` - Start production server
- `npm run build` - Build the application
- `npm run setup` - Install/initialize the application
- `npm run compile` - Compile TypeScript with SWC
- `npm run compile:tsc` - Compile with TypeScript compiler
- `npm run test` - Run unit tests with Jest
- `npm run lint` - Lint files

## Development Conventions

### Code Style
- TypeScript-first approach
- Uses ESLint for code linting with custom rules
- Follows React and Node.js best practices
- Modular architecture with clear separation of concerns

### Testing
- Uses Jest for unit testing
- Tests can be run with `npm run test`

### Extensions Architecture
- Extensions are stored in the `extensions/` directory
- Each extension can add functionality, modify behavior, or provide new features
- Current extensions include: agegate, azure_file_storage, google_login, product_review, resend, s3_file_storage, sendgrid

### Module System
- Core functionality is organized in the `modules/` directory
- Each module (auth, catalog, checkout, etc.) handles specific business logic
- Modules can be enabled/disabled independently

## Database
- Uses PostgreSQL as the primary database
- Includes a custom PostgreSQL query builder (`@evershop/postgres-query-builder`)
- Database schema is automatically created during setup

## Configuration
- Uses a modular configuration system
- Configuration files are located in the `config/` directory
- Supports environment-specific configurations

## Contributing
- Contributions are welcome and should follow the GNU GPL v3.0 license
- Development happens on the `dev` branch
- Contributions include bug reports, fixes, new features, and documentation improvements
- Run linting with `npm run lint` before submitting changes