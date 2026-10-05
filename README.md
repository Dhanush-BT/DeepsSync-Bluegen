# 🌊 DEEPSYNC — Web-Based Interactive 3D Ocean Visualization Platform

[![Java](https://img.shields.io/badge/Java-17-orange.svg)](https://www.oracle.com/java/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.4.0-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://reactjs.org/)
[![Three.js](https://img.shields.io/badge/Three.js-WebGL2-black.svg)](https://threejs.org/)
[![Vite](https://img.shields.io/badge/Vite-5-purple.svg)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC.svg)](https://tailwindcss.com/)

> **National Oceanographic Telemetry & 3D Observation Project** | Problem Statement: **PS 26067**  
> **Organization**: Indian National Centre for Ocean Information Services (**INCOIS**), Ministry of Earth Sciences (MoES)  
> **Team**: BLUEGEN_606 

---

## 📌 Overview

**DEEPSYNC** is an interactive, web-based 3D oceanographic visualization and intelligence platform that seamlessly fuses numerical ocean model simulations (MOM4, HYCOM, CF-compliant NetCDF) with in-situ observational networks (Argo profiling floats, Autonomous Underwater Gliders, CTD rosette casts, and Moored Buoy arrays).

The platform equips ocean scientists, marine researchers, educators, and the public with real-time volumetric isosurfaces, dynamic cross-sectional slicing, 4D temporal playback, and grounded conversational AI analytics.

---

## 🚀 Key Features

### 1. 🌐 Volumetric 3D Ocean Scene (`/dashboard`)
- **WebGL2 / Three.js Volumetric Rendering**: High-performance continuous 3D mesh and point cloud visualization of ocean temperature, practical salinity, chlorophyll-a, and horizontal current vectors ($u, v$).
- **Interactive Spatial Slicers**: Dynamic slicing along Latitude, Longitude, and Depth ($0\text{ m}$ to $-6000\text{ m}$).
- **Vertical Exaggeration & Colormap Palette**: Custom colormaps (Turbo, Viridis, Thermal, Haline, Deep Ocean) with customizable vertical scale stretching.
- **Isosurface Extraction**: Real-time threshold-based surface generation.

### 2. 🗺️ In-Situ Instrument Tracking GeoMap (`/geomap`)
- **Live Platform Telemetry**: Dynamic multi-instrument visualization covering Argo floats, autonomous gliders, CTD casts, and moored buoys.
- **Drift Trajectories & Vectors**: Complete historical cruise tracks with directional bearing indicators and profile soundings.
- **Real-time Sync**: Instant ingestion synchronization for newly uploaded NetCDF/CSV datasets without page reloads.

### 3. 📈 Comprehensive 2D Oceanographic Diagnostics
- **Depth Profile**: Stratification curves showing thermoclines, haloclines, and pycnoclines.
- **T-S Diagram**: Temperature vs. Salinity water mass identification with potential density ($\sigma_\theta$) contours.
- **Time-Series Analysis**: Multi-depth temporal trends and seasonal anomaly tracking.
- **Hovmöller Diagrams**: Depth-time progression tracking.
- **Current Roses & Along-Track Transects**: Ocean current velocity distributions and cruise section interpolations.

### 4. 🤖 AI Oceanographic Query Intelligence (`/assistant`)
- **Context-Grounded Analysis**: Natural language interface providing instantaneous calculations of Mixed Layer Depth (MLD), water mass identification, and active operational hazard advisories.
- **Dynamic In-Chat Charts**: Automatically generates diagnostic charts and profile graphs directly within conversation cards.

### 5. 📂 Data Ingestion & Quality Control (`/datamanager`)
- **Multi-Format Parsers**: Direct ingestion of NetCDF-3/4 (`.nc`), ASCII (`.txt`), and CSV (`.csv`).
- **CF Convention Validation**: Climate and Forecast (CF-1.8) metadata standard validation engine.
- **Automated Entity Association**: Automatically links profile soundings to platform IDs and populates spatial coordinate indexes.

---

## 🛠️ Architecture & Tech Stack

```
                                  ┌─────────────────────────────┐
                                  │      React + Vite Web UI    │
                                  │  Three.js · Leaflet · Chart │
                                  └──────────────┬──────────────┘
                                                 │ HTTP / REST
                                                 ▼
                                  ┌─────────────────────────────┐
                                  │  Spring Boot Backend (8081) │
                                  │  Java 17 · Hibernate · JPA  │
                                  └──────┬───────────────┬──────┘
                                         │               │
                     ┌───────────────────┴──┐     ┌──────┴────────────────┐
                     │ PostgreSQL (PostGIS) │     │ NetCDF-Java / CF-1.8  │
                     │ Port 5433 (deepsync) │     │ Unidata CDM Parser    │
                     └──────────────────────┘     └───────────────────────┘
```

| Layer | Technology Stack |
| :--- | :--- |
| **Frontend** | React 18, Vite 5, Three.js (`@react-three/fiber`), Tailwind CSS, Leaflet, Chart.js, Zustand |
| **Backend** | Spring Boot 3.4.0 (Java 17), Spring Data JPA, Hibernate ORM, Maven |
| **Scientific Data** | Unidata NetCDF-Java (`cdm-core` 5.6.0), Apache Commons CSV |
| **Database** | PostgreSQL 16 (Port 5433) |
| **Security & Auth** | JWT Authentication, Spring Security |

---

## 🏁 Getting Started

### Prerequisites
- **Java 17+** (JDK 17 or higher)
- **Node.js 18+** & `npm`
- **PostgreSQL 15+** running locally on port `5433` (or port `5432`)

### 1. Database Setup
Create a PostgreSQL database named `deepsync`:
```sql
CREATE DATABASE deepsync;
CREATE USER deepsync WITH PASSWORD 'deepsync';
GRANT ALL PRIVILEGES ON DATABASE deepsync TO deepsync;
```
*(You can customize database credentials in `src/main/resources/application.properties`)*.

---

### 2. Run the Backend (Spring Boot)
In the project root directory:
```bash
# Windows
.\mvnw.cmd spring-boot:run

# Linux / macOS
./mvnw spring-boot:run
```
The API server starts on: `http://localhost:8081`  
Check API health: `http://localhost:8081/api/stats/summary`

---

### 3. Run the Frontend (Vite + React)
In another terminal, navigate to `frontend`:
```bash
cd frontend
npm install
npm run dev
```
Open your browser at: `http://localhost:5173`

---

## 📡 REST API Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/ocean-data` | Query 3D volumetric ocean grid points with bounding box, depth, and time filters |
| `GET` | `/api/ocean-data/axes` | Fetch distinct depth slices and temporal stamps |
| `GET` | `/api/floats` | List all active in-situ instruments (Argo, Gliders, CTD, Buoys) |
| `GET` | `/api/floats/{platformId}/track` | Retrieve full GPS trajectory positions for an instrument |
| `GET` | `/api/floats/{platformId}/profiles` | Fetch depth profile measurements for a given platform |
| `GET` | `/api/stats/summary` | Retrieve global aggregated telemetry, platform counts, and grid metrics |
| `POST` | `/api/admin/ingest` | Multipart upload for NetCDF (`.nc`), CSV, or ASCII datasets |
| `POST` | `/api/auth/login` | Authenticate user / admin session |
| `POST` | `/api/auth/signup` | Register new user account |

---

## 📁 Repository Structure

```
DEEPSYNC-APP/
├── frontend/                     # React + Vite Client
│   ├── src/
│   │   ├── components/
│   │   │   ├── dashboard3d/     # Three.js 3D Volumetric Scene & Meshes
│   │   │   ├── dashboard2d/     # T-S, Depth Profile, Hovmöller Charts
│   │   │   ├── geomap/          # Leaflet Interactive Instrument Map
│   │   │   ├── datamanager/     # Dataset Upload & Ingestion Monitor
│   │   │   └── assistant/       # AI Oceanographic Cards & Dynamic Plots
│   │   ├── views/               # Page views (Dashboard, GeoMap, Home, etc.)
│   │   ├── store/               # Zustand state stores
│   │   └── api/                 # Axios API client
├── src/main/java/com/bluegen/deepsyncapp/
│   ├── config/                  # Data seeders & CORS configurations
│   ├── controller/              # REST Controllers
│   ├── entity/                  # JPA Database Entities
│   ├── ingestion/               # NetCDF & ASCII Ingestion Engines
│   ├── repository/              # Spring Data JPA Repositories
│   └── service/                 # Domain business logic & MLD calculation
├── src/main/resources/
│   ├── application.properties   # Database and server configuration
│   └── db/                      # Schema DDL & migrations
└── pom.xml                      # Maven project dependencies
```

---

## 👥 Team BLUEGEN_606

- **Project Statement**: PS 26067 — 3D Ocean Data Visualization Platform
- **Ministry / Organization**: INCOIS | Ministry of Earth Sciences, Govt. of India
