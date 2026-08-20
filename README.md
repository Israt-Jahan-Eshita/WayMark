# WayMark AI

WayMark AI is an automated physical accessibility auditing platform. It leverages vision models to analyze images of buildings and facilities, cross-referencing extracted visible features against standard accessibility guidelines (such as WHO standards). The platform aims to verify accessibility claims using empirical visual evidence rather than subjective assumptions.

## Architecture Overview

The system is composed of two primary services:

### 1. Frontend (Next.js)
A modern, responsive web interface built with Next.js, React, and Tailwind CSS.
- Client-side data fetching and state management.
- Dynamic theme toggling (Light/Dark mode) with user preference persistence.
- Voice-enabled search using native Web Speech API for zero-latency accessibility.
- Interactive accessibility audit reporting and history tracking.

### 2. Backend (FastAPI)
A robust RESTful API built with Python and FastAPI.
- Processes incoming image uploads securely.
- Integrates with the Groq API (Qwen vision models) to perform zero-shot extraction of accessibility features.
- Persists audit history and location data using SQLAlchemy and SQLite.
- Provides specialized endpoints for system querying via an AI assistant.

## Prerequisites

- Node.js (v20 or higher)
- Python (3.11 or higher)
- Git

## Local Development Setup

### Backend Initialization

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   # Windows
   .\venv\Scripts\activate
   # macOS/Linux
   source venv/bin/activate
   ```

3. Install required dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Configure environment variables:
   Create a `.env` file in the `backend` directory with the following keys:
   ```env
   GROQ_API_KEY="your_groq_api_key_here"
   ```

5. Start the backend server:
   ```bash
   python -m uvicorn main:app --reload
   ```
   The API will be available at `http://localhost:8000`.

### Frontend Initialization

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install required dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   Create a `.env.local` file in the `frontend` directory with the following key:
   ```env
   NEXT_PUBLIC_API_URL="http://localhost:8000"
   ```

4. Start the frontend development server:
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:3000`.

## Deployment

### Backend (Render Web Service)
- Build Command: `pip install -r requirements.txt`
- Start Command: `uvicorn main:app --host 0.0.0.0 --port 10000`
- Environment Variables required: `GROQ_API_KEY`

### Frontend (Render Web Service via Docker)
The frontend is containerized for production deployment.
- Ensure the Dockerfile receives the required build arguments.
- Environment Variables required: `NEXT_PUBLIC_API_URL` (Must be set to the live backend URL before deployment to ensure successful client-side data fetching).

## License

All rights reserved.
