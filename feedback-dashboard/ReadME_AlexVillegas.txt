# Feedback Aggregator Dashboard - Cloudflare PM Intern Assignment

## Overview
A prototype feedback aggregation tool built on Cloudflare's Developer Platform that helps product managers aggregate and analyze customer feedback from multiple sources.

**Live URL:** https://feedback-dashboard.alexvillegas00.workers.dev

## Features
- 📊 Real-time feedback aggregation dashboard
- 🎯 Sentiment analysis (positive/negative/neutral)
- 🔢 Urgency scoring (1-5 scale)
- 📈 Analytics and reporting
- 🧪 Mock data generation for testing
- 🌐 Global deployment via Cloudflare's edge network

## Cloudflare Products Used

### 1. Cloudflare Workers
- **Purpose**: Edge compute and hosting
- **Why**: Global deployment with <50ms latency, serverless architecture
- **Implementation**: Hosts the entire application (API + dashboard)

### 2. Cloudflare KV (Key-Value Store)
- **Purpose**: Persistent feedback storage
- **Why**: Fast key-value storage at the edge, perfect for real-time data
- **Implementation**: Stores individual feedback items with metadata

### 3. Cloudflare D1 (SQL Database)
- **Purpose**: Analytics and complex queries
- **Why**: SQLite-compatible database for advanced reporting
- **Implementation**: Powers the analytics dashboard with SQL queries

## Architecture
