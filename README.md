# FutCast

FutCast is a full-stack application that predicts football match outcomes based on weather conditions and historical data. It consists of a **NestJS** backend and a **Next.js** frontend.

## Prerequisites

- [Docker](https://www.docker.com/) & Docker Compose
- [Node.js](https://nodejs.org/) (v22 recommended)

## Running the Project

We provide two Docker Compose configurations for different workflows.

### 1. Local Development (Hot Reload)

Use this flow for active development. It mounts your local source code into the containers, enabling hot reload for both backend and frontend.

```bash
# Start the development environment
docker-compose -f docker-compose.dev.yml up
```

- **Frontend**: [http://localhost:3000](http://localhost:3000)
- **Backend API**: [http://localhost:3001](http://localhost:3001)
- **Database**: Postgres on port `5432`

**Environment Variables**:
- Backend loads from `backend/.env`
- Frontend loads from `frontend/.env`

### 2. Production

Use this flow to run the production build. It builds the optimized Docker images and runs the compiled code, exactly as it would run in production.

```bash
# Build and start the production environment
docker-compose -f docker-compose.prod.yml up --build
```

- **Note**: Changes to source code will NOT be reflected until you rebuild.

## Architecture Overview

### Backend (NestJS)

The backend is organized into modular domains using NestJS modules.

#### Core Modules

- **Events Module** (`src/app/events`)
    - **Responsibilities**: Manages football match data.
    - **`EventsService`**: Handles business logic for retrieving and filtering events.
    - **`EventsSyncService`**: Orchestrates the synchronization of data from external APIs (TheSportsDB) into our database.
    - **`EventsController`**: Exposes REST endpoints for the frontend.

- **Weather Module** (`src/app/weather`)
    - **Responsibilities**: Manages weather data for match venues.
    - **`WeatherService`**: Fetches historical and forecast weather data from OpenMeteo and stores it for each venue.

- **Analysis Module** (`src/app/analysis`)
    - **Responsibilities**: Generates AI-powered predictions.
    - **`AnalysisService`**: Uses LLMs (via OpenRouter) to analyze match data + weather conditions and generate a "FutCast" prediction.

- **Tasks Module** (`src/app/tasks`)
    - **Responsibilities**: Handles background jobs and cron tasks.
    - **`EventsScheduler`**: Periodically triggers event synchronization.
    - **`WeatherScheduler`**: Updates weather forecasts for upcoming matches.
    - **`AnalysisScheduler`**: Triggers analysis generation for new matches.

#### Shared Infrastructure

- **Shared Module** (`src/app/shared`)
    - **Database**: TypeORM configuration, entities, migrations, and seeders.
    - **External APIs**:
        - **`SportsApiService`**: Client for TheSportsDB.
        - **`OpenMeteoService`**: Client for OpenMeteo.
        - **`OpenRouterService`**: Client for AI models.

### Frontend (Next.js)

The frontend is a Next.js application using the App Router.

- **Tech Stack**: React, Tailwind CSS, Lucide Icons.
- **Features**:
    - Displays list of leagues and matches.
    - Shows detailed match analysis and weather forecasts.
    - Responsive design for mobile and desktop.

### Production Database
- In production, the app connects to a managed PostgreSQL database.
- **Migrations**: The backend automatically runs `typeorm migration:run` on startup to ensure the database schema is up-to-date.
