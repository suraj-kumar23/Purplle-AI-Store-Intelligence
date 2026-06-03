# Architectural Choices — Store Intelligence System

This document records the key technical decisions made during the design and implementation of the Store Intelligence System, including the problem each decision addressed, the alternatives evaluated, the tradeoffs considered, and the rationale for the final choice.

---

## Table of Contents

1. [YOLOv8 for Person Detection](#1-yolov8-for-person-detection)
2. [ByteTrack for Multi-Object Tracking](#2-bytetrack-for-multi-object-tracking)
3. [Event-Driven Architecture](#3-event-driven-architecture)
4. [FastAPI for Backend Services](#4-fastapi-for-backend-services)
5. [React for Dashboard](#5-react-for-dashboard)
6. [Docker for Deployment](#6-docker-for-deployment)
7. [SQLAlchemy ORM for Data Persistence](#7-sqlalchemy-orm-for-data-persistence)
8. [AI-Assisted Development Log](#8-ai-assisted-development-log)

---

## 1. YOLOv8 for Person Detection

### Problem

Retail analytics requires reliable, real-time people detection across CCTV-quality video streams. The system must process frames fast enough to support live zone tracking and queue monitoring without significant latency.

### Alternatives Evaluated

| Model         | Accuracy | Inference Speed | Deployment Complexity |
|---------------|----------|-----------------|----------------------|
| Faster R-CNN  | High     | Slow (~5 fps)   | Moderate             |
| SSD           | Medium   | Fast            | Low                  |
| YOLOv5        | High     | Fast            | Low                  |
| **YOLOv8**    | **High** | **Very Fast**   | **Low**              |

### Decision

**YOLOv8** was selected.

### Rationale

At retail camera densities (typically 5–20 people in frame), YOLOv8 achieves accuracy comparable to Faster R-CNN while running at 30+ fps on CPU hardware — a requirement for real-time zone and queue detection. Faster R-CNN's two-stage architecture produces marginally better accuracy on crowded scenes but cannot meet the latency budget without dedicated GPU infrastructure.

YOLOv8 also offers a well-maintained Python SDK (Ultralytics), strong community support, and pretrained weights for the `person` class that require no additional fine-tuning for standard retail environments.

### Tradeoff Accepted

YOLOv8 may produce slightly more false positives in highly occluded scenes (e.g., dense end-of-day crowds) compared to Faster R-CNN. This is mitigated by the tracking layer, which filters short-lived detections that do not persist across frames.

---

## 2. ByteTrack for Multi-Object Tracking

### Problem

Person detection alone produces a new, anonymous set of bounding boxes on every frame. To generate customer journey analytics, the system needs to maintain consistent identities across frames — including when people are briefly occluded, move between cameras, or leave and re-enter the frame.

### Alternatives Evaluated

| Tracker       | Accuracy | Occlusion Handling | Requires Appearance Model | Complexity |
|---------------|----------|--------------------|---------------------------|------------|
| DeepSORT      | High     | Good               | Yes (ReID network)        | High       |
| SORT          | Medium   | Poor               | No                        | Low        |
| **ByteTrack** | **High** | **Excellent**      | **No**                    | **Low**    |

### Decision

**ByteTrack** was selected.

### Rationale

ByteTrack's key innovation is using low-confidence detections (which DeepSORT and SORT discard) to maintain tracklets through brief occlusions. This is particularly valuable in retail environments where customers frequently occlude each other near shelves or at checkout.

Unlike DeepSORT, ByteTrack does not require a separate ReID (re-identification) appearance model, which removes a significant inference overhead and eliminates any dependency on feature extraction that could edge toward facial recognition. ByteTrack achieves state-of-the-art tracking accuracy on standard benchmarks using motion cues alone.

### Tradeoff Accepted

ByteTrack does not re-identify visitors who leave and return to the store as the same individual — a returning customer is assigned a new visitor ID. This is intentional: re-identification across separate visits would require appearance features that raise privacy concerns. The `REENTRY` event handles the within-session case.

---

## 3. Event-Driven Architecture

### Problem

A naive implementation might derive all analytics directly from raw tracking data (positions and bounding boxes) at query time. This approach is computationally expensive, difficult to test, and produces no persistent audit trail.

### Alternatives Considered

| Approach               | Latency   | Testability | Auditability | Scalability |
|------------------------|-----------|-------------|--------------|-------------|
| Frame-level analytics  | Very high | Poor        | None         | Poor        |
| Polling-based events   | Medium    | Moderate    | Partial      | Moderate    |
| **Event-driven**       | **Low**   | **High**    | **Full**     | **High**    |

### Decision

**Event-driven architecture** was adopted throughout the pipeline.

### Rationale

By converting tracking data into discrete business events (`ENTRY`, `ZONE_DWELL`, `BILLING_QUEUE_JOIN`, etc.) at the earliest possible stage, the system achieves three properties:

1. **Testability** — analytics logic operates on structured event records, not live video frames. The entire analytics layer can be unit-tested with synthetic event data, independently of the computer vision pipeline.
2. **Auditability** — every customer interaction produces a timestamped, persisted record. The full session history can be replayed from the event log.
3. **Scalability** — events are orders of magnitude smaller than video frames. As the system scales to multiple cameras and stores, the event stream can be routed through Kafka without changing the analytics layer.

### Tradeoff Accepted

Event generation requires zone polygon definitions to be maintained and kept in sync with camera positions. If a camera is moved or a zone boundary changes, historical events may not reflect the new layout. This is documented as a configuration management concern for production deployments.

---

## 4. FastAPI for Backend Services

### Problem

The system needs a backend API layer that can serve analytics data to the dashboard with low latency, expose a clean REST interface, and be easy to extend as new analytics endpoints are added.

### Alternatives Evaluated

| Framework   | Performance | Developer Experience | OpenAPI Support | Async Native |
|-------------|-------------|---------------------|-----------------|--------------|
| Flask       | Good        | Good                | Plugin required | No           |
| Django REST | Moderate    | Excellent           | Plugin required | Partial      |
| **FastAPI** | **Excellent** | **Excellent**     | **Built-in**    | **Yes**      |

### Decision

**FastAPI** was selected.

### Rationale

FastAPI's automatic OpenAPI documentation generation (`/docs`) significantly reduces the overhead of maintaining API documentation during development — the documentation is always in sync with the actual endpoint signatures. Native async support means I/O-bound operations (database queries, event ingestion) do not block the server under concurrent dashboard requests.

Pydantic-based request and response models provide automatic validation and serialization, catching schema errors at the boundary before they reach the analytics layer.

### Tradeoff Accepted

FastAPI's async model requires care when mixing sync and async database operations. SQLAlchemy's async extension was used to ensure database calls do not block the event loop.

---

## 5. React for Dashboard

### Problem

The dashboard needs to display multiple chart types (funnels, heatmaps, time series), update in real time, and be maintainable as the number of views grows.

### Alternatives Evaluated

| Option         | Chart Ecosystem | Component Model | Real-time Support | Complexity |
|----------------|-----------------|-----------------|-------------------|------------|
| Plain HTML/JS  | Limited         | None            | Manual            | Low        |
| Vue + Chart.js | Good            | Good            | Moderate          | Moderate   |
| **React + Recharts** | **Excellent** | **Excellent** | **Excellent** | **Moderate** |

### Decision

**React with Recharts and Material UI** was selected.

### Rationale

React's component model maps naturally to the dashboard's structure — each analytics view (funnel, heatmap, anomalies) is an independent component that can be developed and tested in isolation. Recharts provides responsive, composable chart primitives that integrate cleanly with React's state model, making the 5-second auto-refresh straightforward to implement.

Material UI provided production-quality layout components (grids, cards, tables) without requiring custom CSS, keeping the dashboard visually consistent with minimal styling overhead.

### Tradeoff Accepted

React's bundle size is heavier than a plain HTML/JS dashboard. For a retail analytics tool where performance is measured in analytics query latency rather than initial page load, this is an acceptable tradeoff.

---

## 6. Docker for Deployment

### Problem

The system has multiple components (Python backend, React dashboard, and SQLAlchemy-based persistence layer) with specific dependency versions. Deployment needs to be reproducible across development machines and production environments.

### Alternatives Evaluated

| Approach               | Reproducibility | Setup Complexity | Production Ready |
|------------------------|-----------------|------------------|------------------|
| Manual installation    | Poor            | High             | No               |
| Virtual environments   | Partial         | Moderate         | Partial          |
| **Docker Compose**     | **Excellent**   | **Low**          | **Yes**          |

### Decision

**Docker with Docker Compose** was selected.

### Rationale

Docker Compose allows the entire stack to be started with a single command (`docker compose up --build`), with all service dependencies, environment variables, and network configuration defined in version-controlled files. This eliminates "works on my machine" issues during evaluation and provides a clear path to production deployment.

Separate Dockerfiles for the backend and dashboard allow independent rebuilds when only one component changes.

### Tradeoff Accepted

Docker adds overhead for local development compared to running services directly. This is mitigated by supporting both Docker and direct local execution (see README).

---

## 7. SQLAlchemy ORM for Data Persistence

### Problem

The system needs a persistence abstraction layer capable of supporting event storage, session tracking, and analytics aggregation while remaining flexible enough to support different database backends.

### Decision

SQLAlchemy ORM was selected.

### Rationale

SQLAlchemy provides a clean abstraction between application logic and database infrastructure. It enables the project to remain database-agnostic during development while supporting migration to PostgreSQL in production environments.

The challenge implementation focuses on analytics functionality and API design while maintaining a database-ready architecture for future scaling.

### Tradeoff Accepted

An ORM abstraction adds a small amount of complexity compared to direct in-memory processing, but provides flexibility and maintainability as the system evolves.

### Problem

The system needs to persist events, sessions, and analytics data in a way that supports efficient time-window queries, aggregations, and potential multi-store scaling.

### Alternatives Evaluated

| Approach                     | Flexibility | Scalability | Development Effort | Challenge Fit |
|-----------------------------|-------------|-------------|-------------------|---------------|
| In-Memory Storage           | Low         | Low         | Very Low          | Good          |
| Direct Database Integration | Medium      | High        | High              | Moderate      |
| **SQLAlchemy ORM Layer**    | **High**    | **High**    | **Moderate**      | **Excellent** |

### Decision

**SQLAlchemy** ORM was selected as the persistence abstraction layer. PostgreSQL remains the intended production database for future scalability.

### Rationale

The analytics layer relies heavily on aggregation queries (COUNT, SUM, AVG grouped by time window and zone). PostgreSQL's query planner handles these efficiently, and its JSONB support allows event metadata to be stored flexibly without schema migrations for each new event field.

SQLite was considered for its simplicity but rejected because it does not support concurrent writes from multiple pipeline workers — a requirement as soon as a second camera is added.

PostgreSQL also provides a clear upgrade path to TimescaleDB for time-series optimization if event volume grows significantly.

### Tradeoff Accepted

PostgreSQL requires more operational setup than SQLite (separate process, connection pooling). For the challenge scope this is fully managed by Docker Compose, with no manual configuration required.

---

## 8. AI-Assisted Development Log

AI tooling was used as a development accelerant throughout the project. This section documents what was suggested, what was accepted, and what was rejected — providing full transparency on the role of AI in the technical decisions above.

### Suggestions Accepted

| Suggestion                                        | Area              | Outcome                                              |
|---------------------------------------------------|-------------------|------------------------------------------------------|
| Event-driven architecture over frame polling      | System design     | Adopted as the core pipeline pattern                 |
| FastAPI with Pydantic models for API layer        | Backend           | Adopted; automatic validation proved valuable        |
| ByteTrack over DeepSORT                           | Tracking          | Adopted after confirming performance on benchmarks   |
| 5-second polling with live timestamp in dashboard | Frontend          | Adopted; keeps dashboard simple vs. WebSocket        |
| pytest fixtures for synthetic event testing       | Testing           | Adopted; enabled full analytics layer testing        |

### Suggestions Rejected

| Suggestion                                       | Reason Rejected                                                       |
|--------------------------------------------------|-----------------------------------------------------------------------|
| Microservice per pipeline layer                  | Excessive operational complexity for single-store challenge scope     |
| Celery + Redis task queue for event ingestion    | Adds infrastructure without meaningful benefit at current event volume |
| Facial recognition for cross-visit reentry       | Privacy non-starter; incompatible with GDPR-friendly design goal      |
| Excessive database normalization (6NF schema)    | Over-engineered for analytics read patterns; adds join overhead       |
| GraphQL instead of REST                          | REST is sufficient; GraphQL adds complexity without benefit here      |

### Process

AI was used in a consultative capacity — generating options, surfacing tradeoffs, and accelerating implementation of decided approaches. All final decisions, architecture choices, and code commits were made and reviewed by the development team. No generated code was merged without review and validation against the system's behavior.