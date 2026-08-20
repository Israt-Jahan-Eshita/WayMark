# WayMark AI

**WayMark AI** is a highly scalable, automated physical accessibility auditing platform designed to verify accessibility claims using empirical visual evidence rather than subjective assumptions. Built with modern web technologies and advanced vision models, it bridges the gap between claimed accessibility and verified reality.

## The Problem

Public spaces frequently claim to be "accessible," but there is no reliable, scalable way to verify these claims. Information is often inconsistent, based on unverified statements rather than evidence, and manual auditing is far too slow and resource-intensive to scale effectively.

## The Solution

WayMark AI automates the auditing process using cutting-edge Vision-Language Models (VLMs). 

1. A user submits photos of a building or facility.
2. The AI vision model extracts exactly what is visibly present—no assumptions, no hallucination.
3. Extracted features are programmatically checked against a curated accessibility checklist based on established standards.
4. The system outputs a structured, verifiable audit report, highlighting verified features, flagged issues, and criteria that cannot be verified from the photos alone.

## System Architecture

WayMark AI is built on a decoupled, microservices-oriented architecture to ensure high performance and scalability.

### 1. Frontend: Next.js Client
The frontend is a robust, responsive web interface built with **Next.js 16**, **React 19**, and **Tailwind CSS v4**.

- **Neumorphic & Glassmorphic UI:** A premium, modern design language ensuring high accessibility and visual appeal.
- **Dynamic Theming:** Seamless Light/Dark mode toggling with persistent user preferences.
- **Zero-Latency Voice Search:** Integrates the native Web Speech API for instant, completely free voice transcription, bypassing backend latency.
- **Client-Side Rendering (CSR) & Server-Side Rendering (SSR):** Optimized data fetching strategies for rapid page loads and seamless navigation.
- **Dockerized Deployment:** Fully containerized using a custom Dockerfile for reproducible and immutable deployments on Render.

### 2. Backend: FastAPI Service
The backend is a high-performance RESTful API powered by **Python 3.11** and **FastAPI**.

- **Asynchronous Processing:** Non-blocking endpoints handle image uploads and AI processing concurrently.
- **VLM Integration:** Communicates with custom Groq-hosted vision models (`qwen/qwen3.6-27b`) for rapid zero-shot feature extraction.
- **Structured Database:** Utilizes **SQLite** via **SQLAlchemy** ORM for persistent storage of building records, audit histories, and extraction metadata.
- **WayMark AI Assistant:** A dedicated, context-aware chatbot endpoint that strictly adheres to the system's core domains (accessibility standards and platform logic), ensuring focused user assistance.

## Technical Stack

| Component | Technology |
|---|---|
| **Framework** | Next.js 16 (App Router), React 19 |
| **Styling** | Tailwind CSS v4, Framer Motion |
| **Backend API** | FastAPI, Python 3.11, Pydantic |
| **Database** | SQLite, SQLAlchemy ORM |
| **AI Integration** | Groq Client, Qwen Vision Models |
| **Containerization** | Docker |
| **Deployment** | Render Web Services |

## AI Auditing Standard

The system evaluates properties against a curated accessibility checklist derived from recognized guidelines (e.g., WHO standards). 

Key criteria include:
- Ramp access and step-free entrances
- Doorway width and threshold levels
- Tactile guidance and paving
- Accessible restroom facilities

The AI model is strictly prompted to extract only *visibly present* information, eliminating assumptions and ensuring the integrity of the audit.

## Local Development Guide

### Prerequisites
- Node.js (v20+)
- Python (3.11+)
- Docker (optional, for frontend testing)

### Backend Setup

1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```
2. **Initialize a virtual environment:**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows use `.\venv\Scripts\activate`
   ```
3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```
4. **Environment Variables:**
   Create a `.env` file in the `backend` directory:
   ```env
   GROQ_API_KEY="your_api_key_here"
   ```
5. **Run the server:**
   ```bash
   uvicorn main:app --reload
   ```

### Frontend Setup

1. **Navigate to the frontend directory:**
   ```bash
   cd frontend
   ```
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Environment Variables:**
   Create a `.env.local` file in the `frontend` directory:
   ```env
   NEXT_PUBLIC_API_URL="http://localhost:8000"
   ```
4. **Run the development server:**
   ```bash
   npm run dev
   ```

### Docker Implementation

The frontend application is fully containerized to ensure consistency across deployment environments. To build and run the Docker container locally:

```bash
cd frontend
docker build --build-arg NEXT_PUBLIC_API_URL="http://localhost:8000" -t waymark-frontend .
docker run -p 3000:3000 waymark-frontend
```

## Deployment Strategy

Both the frontend and backend are optimized for deployment on **Render**.

- **Backend:** Deployed as a standard Python Web Service.
- **Frontend:** Deployed as a Docker Web Service. The `NEXT_PUBLIC_API_URL` is passed dynamically as a build argument during the Docker build phase, ensuring the Next.js static generation binds to the live production API seamlessly.

## License

All rights reserved by the WayMark AI team.
