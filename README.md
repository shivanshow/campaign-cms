# 🚀 Campaign Management System

A full-featured **Campaign Management System** built with **Strapi (Node.js backend)**, designed for both technical and non-technical users.

---

## 📌 Overview

This system provides a centralized platform to:

- Manage campaigns across multiple channels
- Track performance metrics and analytics
- Organize ad creatives and clients
- Enforce business rules like budget constraints
- Support role-based access

---

## 🧱 Tech Stack

- **Backend:** Strapi (Node.js)
- **Database:** SQLite / PostgreSQL
- **API:** REST
- **Auth:** Role-Based Access Control (RBAC)

---

## 📦 Content Types

### Campaign
- title
- status (enum)
- channel
- start_date
- end_date
- budget
- spent_budget
- goals
- target_audience (JSON)

---

### Client
- name
- industry
- contact_email
- contact_phone
- logo
- is_active

---

### Ad Creative
- name
- type
- headline
- body_copy
- cta_text
- cta_url
- media
- status

---

### Analytics Event
- date
- impressions
- clicks
- conversions
- spend
- ctr (auto-calculated)
- conversion_rate (auto-calculated)
- platform

---

### Tag
- name
- color

**Relations:**
- Many-to-many with Campaign

---

## 🔌 API Endpoints

### Standard CRUD

#### Campaigns
- GET `/api/campaigns`
- GET `/api/campaigns/:id`
- POST `/api/campaigns`
- PUT `/api/campaigns/:id`
- DELETE `/api/campaigns/:id`

#### Clients
- GET `/api/clients`
- GET `/api/clients/:id`
- POST `/api/clients`
- PUT `/api/clients/:id`
- DELETE `/api/clients/:id`

#### Ad Creatives
- GET `/api/ad-creatives`
- GET `/api/ad-creatives/:id`
- POST `/api/ad-creatives`
- PUT `/api/ad-creatives/:id`
- DELETE `/api/ad-creatives/:id`

#### Analytics Events
- GET `/api/analytics-events`
- GET `/api/analytics-events/:id`
- POST `/api/analytics-events`
- PUT `/api/analytics-events/:id`
- DELETE `/api/analytics-events/:id`

#### Tags
- GET `/api/tags`
- GET `/api/tags/:id`
- POST `/api/tags`
- PUT `/api/tags/:id`
- DELETE `/api/tags/:id`

---

## ⚡ Custom Endpoints

### Active Campaigns
GET `/api/campaigns/active`

Returns campaigns where:
start_date ≤ today ≤ end_date

---

### Analytics Summary
GET `/api/campaigns/:id/analytics-summary`

Returns:
- CTR
- conversions
- spend
- budget utilization

---

### Duplicate Campaign
POST `/api/campaigns/:id/duplicate`

- Clones campaign
- Copies creatives
- Resets spent_budget and status

---

### Update Status
PATCH `/api/campaigns/:id/status`

- Enforces valid state transitions

---

## 🧠 Business Logic

### Campaign Hooks

**beforeCreate**
- status = draft
- validate end_date > start_date
- spent_budget = 0

**beforeUpdate**
- validate dates
- prevent spent_budget > budget

**afterUpdate**
- audit log on status change
- budget warnings
- trigger webhook

---

### Analytics Hooks

- ctr = clicks / impressions
- conversion_rate = conversions / clicks

---

### Client Hooks

- email normalized to lowercase
- is_active = true (default)

---

## 🛡️ Policies & Middleware

### Budget Guard
Blocks update if:
spent_budget > budget

---

### Request Logger
Logs:
- method
- URL
- status
- response time
- IP

---

## ⏱️ Cron Jobs

### Nightly Auto Expiry

- Marks campaigns as completed
- Condition: end_date < today

---

## 🔔 Webhooks

On every campaign status change:
POST → `CAMPAIGN_WEBHOOK_URL`

---

## 🔐 Roles & Permissions

### Admin
- Full access

### Campaign Manager
- Manage campaigns & creatives
- Read-only analytics

### Analyst
- Read campaigns
- Full analytics access

### Client User
- Read-only campaigns and analytics

---

## 📈 Key Features

- Clean API design
- Strong business rule enforcement
- Automated analytics calculations
- Role-based access control
- Scalable architecture using Strapi

---

## 🚀 Getting Started

```bash
npm install
npm run develop

Server runs on:
http://localhost:1337
