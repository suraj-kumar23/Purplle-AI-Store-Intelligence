# Design Document — Store Intelligence System

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Layered Architecture](#2-layered-architecture)
3. [Detection Layer](#3-detection-layer)
4. [Tracking Layer](#4-tracking-layer)
5. [Event Layer](#5-event-layer)
6. [Session Layer](#6-session-layer)
7. [Analytics Layer](#7-analytics-layer)
8. [API Layer](#8-api-layer)
9. [Dashboard Layer](#9-dashboard-layer)
10. [Data Model](#10-data-model)
11. [Performance Considerations](#11-performance-considerations)
12. [Scalability](#12-scalability)
13. [Security & Privacy](#13-security--privacy)
14. [AI-Assisted Development](#14-ai-assisted-development)

---

## 1. System Overview

The Store Intelligence System is built around a single architectural principle: **convert raw video frames into discrete, structured business events as early in the pipeline as possible.**

This approach decouples the computationally intensive computer vision work from the analytics layer, keeps the analytics layer stateless and testable, and produces an audit trail of every customer interaction that can be replayed, aggregated, or streamed.

The full data flow:

```
CCTV Feed
    ↓
[Detection Layer]   YOLOv8 — identifies people in each frame
    ↓
[Tracking Layer]    ByteTrack — assigns persistent IDs across frames
    ↓
[Event Layer]       Business event generation (ENTRY, ZONE_ENTER, etc.)
    ↓
[Session Layer]     Customer journey aggregation per visitor ID
    ↓
[Analytics Layer]   Metrics, funnels, heatmaps, anomaly detection
    ↓
[API Layer]         FastAPI REST endpoints
    ↓
[Dashboard Layer]   React + Recharts visualization
```

---

## 2. Layered Architecture

Each layer has a single responsibility and communicates with adjacent layers through well-defined contracts:

| Layer      | Input                     | Output                          | Technology         |
|------------|---------------------------|---------------------------------|--------------------|
| Detection  | Video frame               | Bounding boxes + confidence     | YOLOv8, OpenCV     |
| Tracking   | Bounding boxes per frame  | Visitor ID + position           | ByteTrack          |
| Event      | Visitor ID + position     | Structured business events      | Python             |
| Session    | Stream of events          | Customer journey object         | Python, SQLAlchemy ORM |
| Analytics  | Sessions + events         | KPIs, funnels, heatmaps         | Pandas, SQLAlchemy ORM |
| API        | HTTP requests             | JSON responses                  | FastAPI            |
| Dashboard  | REST API responses        | Visual components               | React, Recharts    |

Keeping the layers cleanly separated means the tracking algorithm can be swapped without touching analytics, and analytics logic can be unit-tested without a live camera feed.

---

## 3. Detection Layer

### Responsibility

Detect the presence and position of people in each video frame.

### Implementation

YOLOv8 (nano or small variant) runs inference on each frame and produces:

- **Bounding boxes** — pixel coordinates of each detected person
- **Confidence scores** — detection certainty (frames below threshold are filtered)
- **Class filter** — only `person` class detections are forwarded downstream

### Input / Output Contract

```
Input:  Raw video frame (numpy array, BGR)
Output: List of detections [{bbox: [x1,y1,x2,y2], confidence: float}]
```

### Design Decision

YOLOv8 was chosen over Faster R-CNN for real-time performance. At the latency required for live retail analytics, Faster R-CNN's accuracy advantage does not justify the inference overhead. See CHOICES.md for the full evaluation.

---

## 4. Tracking Layer

### Responsibility

Assign persistent, consistent identities to detected people across video frames, even when they temporarily leave the frame or are occluded.

### Implementation

ByteTrack maintains a set of tracklets — each corresponding to a unique visitor in the current session. It uses Kalman filtering to predict the next position of each tracklet and the Hungarian algorithm to match incoming detections to existing tracks.

### Input / Output Contract

```
Input:  List of bounding boxes per frame
Output: List of tracked objects [{visitor_id: int, bbox: [...], path: [(x,y)]}]
```

### Output

- **Visitor IDs** — anonymous integer identifiers, stable for the duration of a visit
- **Movement paths** — sequence of (x, y) centroids used for zone and queue detection

---

## 5. Event Layer

### Responsibility

Convert low-level tracking data (positions and paths) into high-level, semantically meaningful business events.

### Event Taxonomy

| Event                   | Trigger Condition                                                       |
|-------------------------|-------------------------------------------------------------------------|
| `ENTRY`                 | Visitor centroid crosses the store entry boundary inward                |
| `EXIT`                  | Visitor centroid crosses the store entry boundary outward               |
| `ZONE_ENTER`            | Visitor centroid enters a defined zone polygon                          |
| `ZONE_EXIT`             | Visitor centroid leaves a defined zone polygon                          |
| `ZONE_DWELL`            | Visitor remains in a zone beyond the configurable dwell threshold       |
| `BILLING_QUEUE_JOIN`    | Visitor centroid enters the billing zone polygon                        |
| `BILLING_QUEUE_ABANDON` | Visitor exits billing zone without a subsequent `EXIT` + purchase event |
| `REENTRY`               | Visitor ID is seen at `ENTRY` while an existing session is still open   |

### Event Schema

```json
{
  "event_type": "ZONE_DWELL",
  "visitor_id": 42,
  "zone_id": "electronics",
  "timestamp": "2025-06-01T14:32:11Z",
  "dwell_seconds": 87,
  "session_id": "sess_20250601_042"
}
```

### Design Rationale

Modeling interactions as events rather than raw frame data provides three advantages:

1. **Scalability** — events are orders of magnitude smaller than video frames
2. **Auditability** — every customer interaction has a discrete, timestamped record
3. **Composability** — analytics are simple aggregations over an event stream, easy to extend

---

## 6. Session Layer

### Responsibility

Group events belonging to the same customer visit into a coherent session object representing the full customer journey.

### Session Object

```python
{
  "session_id": str,
  "visitor_id": int,
  "entry_time": datetime,
  "exit_time": datetime | None,
  "visited_zones": [str],          # ordered list of zones visited
  "dwell_times": {zone_id: seconds},
  "reached_billing": bool,
  "completed_purchase": bool,
  "reentry_count": int
}
```

### Reentry Detection

A reentry is detected when a visitor ID triggers an `ENTRY` event while their previous session has not yet been closed by an `EXIT` event. This handles the common case of a customer briefly stepping outside and returning.

---

## 7. Analytics Layer

### Responsibility

Aggregate sessions and events into business-facing metrics, funnels, heatmaps, and anomaly signals.

### Metrics

| Metric               | Calculation                                              |
|----------------------|----------------------------------------------------------|
| Unique Visitors      | Count of distinct session IDs in the time window         |
| Conversion Rate      | Sessions with `completed_purchase = true` / total sessions |
| Revenue              | Sum of POS transaction amounts joined on session         |
| Revenue per Visitor  | Total revenue / unique visitors                          |
| Avg Dwell Time       | Mean of total session duration across all sessions       |

### Conversion Funnel

```
ENTRY
  → ZONE_VISIT       (visited at least one product zone)
    → BILLING        (entered billing queue)
      → PURCHASE     (transaction recorded in POS)
```

Each stage is expressed as both an absolute count and a percentage of the previous stage, enabling retailers to identify where customers are dropping off.

### Heatmap

Zone visit frequency is computed as the count of `ZONE_ENTER` events per zone within the selected time window. Dwell intensity is computed as the sum of `ZONE_DWELL` durations per zone.

### Anomaly Detection

| Anomaly              | Detection Logic                                                          |
|----------------------|--------------------------------------------------------------------------|
| Billing Congestion   | `BILLING_QUEUE_JOIN` events per minute exceeds rolling average by 2σ    |
| Queue Spike          | Active visitors in billing zone exceeds capacity threshold               |
| Conversion Drop      | Conversion rate in last hour falls below 7-day rolling average by 20%+  |

---

## 8. API Layer

### Responsibility

Expose analytics data via a REST API consumed by the dashboard and any downstream integrations.

### Implementation

FastAPI was chosen for its automatic OpenAPI documentation generation, native async support, and Pydantic-based request/response validation. All endpoints return structured JSON and include error handling with appropriate HTTP status codes.

### Endpoint Summary

```
GET  /health          →  Service health + uptime
GET  /metrics         →  Aggregated KPIs (visitors, revenue, conversion)
GET  /funnel          →  Funnel stage counts and drop-off rates
GET  /heatmap         →  Zone visit and dwell frequency
GET  /anomalies       →  Active anomaly alerts
GET  /products        →  Product-level visit and purchase data
GET  /brands          →  Brand-level analytics
POST /events/ingest   →  Ingest new tracking events
```

All `GET` endpoints accept optional `start` and `end` query parameters for time-window filtering.

---

## 9. Dashboard Layer

### Responsibility

Present analytics data in an accessible, real-time visual interface for store managers and retail operations teams.

### Implementation

Built with React, Material UI, and Recharts. The dashboard polls the API every 5 seconds and displays a live timestamp to confirm data freshness.

### Views

| View               | Key Components                                              |
|--------------------|-------------------------------------------------------------|
| Overview           | Visitor count, revenue, conversion rate, anomaly indicator  |
| Funnel             | Stacked bar chart with drop-off annotations                 |
| Heatmap            | Zone grid with color intensity by visit frequency           |
| Anomalies          | Alert feed with severity, type, and timestamp               |
| Product Analytics  | Ranked table of products by visits and conversion           |

---

## 10. Data Model

### Core Tables

```
visitors        (visitor_id, first_seen, last_seen)
sessions        (session_id, visitor_id, entry_time, exit_time, purchased)
events          (event_id, session_id, visitor_id, event_type, zone_id, timestamp, metadata)
zones           (zone_id, name, polygon_coords, capacity)
transactions    (transaction_id, session_id, amount, timestamp, items)
```

Events are the source of truth. All analytics are derived from event aggregations, making the system fully replayable from the event log.

---

## 11. Performance Considerations

### Current System

| Bottleneck          | Current Approach                                       |
|---------------------|--------------------------------------------------------|
| Inference latency   | YOLOv8-nano for 30fps real-time on CPU; GPU optional  |
| Tracking overhead   | ByteTrack O(n) per frame, negligible at retail density |
| Analytics queries   | Pandas aggregations on SQLAlchemy-managed data          |
| API response time   | Sub-100ms for pre-aggregated metrics endpoints         |

### Optimization Opportunities

| Optimization        | Benefit                                                 | When to Apply              |
|---------------------|---------------------------------------------------------|----------------------------|
| GPU inference       | 5–10× detection speedup                                 | Multi-camera deployments   |
| Event batching      | Reduce write pressure on persistence layer                     | High visitor volume         |
| Redis caching       | Sub-millisecond repeated metric reads                   | Dashboard heavy traffic     |
| Kafka streaming     | Decouple pipeline from analytics at scale               | Multi-store or real-time    |
| Pre-aggregation     | Hourly materialized views for historical queries        | Large historical datasets   |

---

## 12. Scalability

The current architecture is designed to scale incrementally:

**Phase 1 — Single store, single camera (current)**
Stack is fully containerized. Runs on a single machine with Docker Compose.

**Phase 2 — Single store, multi-camera**
Multiple pipeline workers feed events into a shared persistence layer. ByteTrack instances synchronized by overlapping zone assignments.

**Phase 3 — Multi-store**
Kafka event streaming replaces direct DB writes. Each store has an isolated pipeline; a central aggregation service powers cross-store analytics.

**Phase 4 — Enterprise scale**
Kubernetes deployment with horizontal scaling of API and pipeline workers. Redis cluster for caching. Time-series database (TimescaleDB) for high-volume event storage.

---

## 13. Security & Privacy

**No facial recognition.** The system uses bounding-box detection only. No biometric data is extracted or stored at any stage.

**Anonymous visitor IDs.** IDs are integers generated by the tracker and scoped to a single camera session. They are not linked to any personal identifier.

**No video storage.** The pipeline processes frames in memory. Raw video is not persisted by the system.

**GDPR alignment.** Because no personal data is collected, the system is compatible with GDPR Article 25 (data protection by design and by default). Visitor IDs expire with sessions and are not used across visits.

---

## 14. AI-Assisted Development

AI tooling was used throughout the development process to accelerate implementation and improve design quality.

### Where AI Was Used

| Area                        | How AI Assisted                                                  |
|-----------------------------|------------------------------------------------------------------|
| Architecture brainstorming  | Explored event-driven vs. frame-polling design tradeoffs         |
| API design                  | Reviewed endpoint structure and response schema consistency      |
| Dashboard UX                | Suggested auto-refresh pattern and live timestamp approach       |
| Test generation             | Assisted in scaffolding test cases for edge event scenarios      |
| Documentation               | Helped structure and expand technical documentation              |

### Human Decisions

All consequential technical decisions were made and validated by the development team:

- Final architecture selection (event-driven pipeline)
- Event taxonomy definition (what constitutes a business event)
- Business metric definitions (conversion rate calculation, anomaly thresholds)
- Queue detection logic (polygon-based rather than depth-estimation)
- Technology stack final choices

### What Was Rejected from AI Suggestions

| Suggestion                           | Reason Rejected                                                  |
|--------------------------------------|------------------------------------------------------------------|
| Microservice-per-layer architecture  | Excessive operational complexity for challenge scope             |
| Facial recognition for reentry       | Privacy non-starter; ByteTrack session tracking is sufficient    |
| Celery task queue for event ingestion| Adds infrastructure overhead not justified at current scale      |

All AI-generated code was reviewed, tested, and modified before integration. No generated code was committed without human validation.