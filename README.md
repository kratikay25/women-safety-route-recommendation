# Women's Safety Route Recommendation System

## Overview

The Women's Safety Route Recommendation System is a web-based application designed to recommend comparatively safer routes for users travelling within Delhi.

Unlike conventional navigation systems that primarily focus on the shortest distance, this project incorporates historical crime statistics and accessibility to essential emergency services into route evaluation.

## Objectives

- Recommend comparatively safer routes.
- Compare the shortest route with a safety-weighted route.
- Analyse road-level crime-related information.
- Consider proximity to police stations and hospitals.
- Visualise route recommendations on an interactive map.

## Technology Stack

### Frontend
- React.js
- Vite
- Leaflet

### Backend
- Python
- Flask
- NetworkX
- Pandas

## Safety Parameters

The system considers:

- Crime Index
- Crime Density
- Total Crimes
- Distance from Police Stations
- Distance from Hospitals

## Routing Methodology

The road network is represented as a graph.

The application calculates:
1. The shortest route using road length.
2. A comparatively safer route using a weighted risk score.

The safety score is an estimate based on the available dataset and should not be interpreted as a guarantee of personal safety.

## Project Structure

```text
women-safety-route-recommendation/
├── backend/
├── frontend/
├── src/
├── data/
├── outputs/
├── README.md
└── .gitignore
