
# BeyondChats
---

## 🏗 Architecture

![alt text](image.png)

---

## ⚙️ Setup

### Backend (Laravel)

```bash
cd Backend-laravel
docker build -t laravel-app .
docker run -p 8000:8000 --env-file .env laravel-app
```

Neon DB credentials: [https://console.neon.tech/](https://console.neon.tech/)

---

### Worker (Node)

**1. Scrape oldest 5 blogs**

```bash
cd workers/blog-scraper-worker
node worker_1.js
```

**2. Rewrite top 2 articles with AI**

```bash
cd workers/blog-scraper-worker/ReupdatedBlog-GPT-worker
node worker_2.js
```

---

## 🧱 Components

### 1️⃣ Backend — Laravel API

**Responsibilities**

* Validation
* CRUD
* Single source of truth

**Tech**

* Laravel 12
* PHP 8.2
* PostgreSQL (Neon)

**APIs**

```
GET    /api/articles
GET    /api/articles/latest
GET    /api/articles/{id}
POST   /api/articles
PUT    /api/articles/{id}
DELETE /api/articles/{id}
```

**Schema: `articles`**

```
id
title
slug
content
updated_content
source_url
is_generated
timestamps
```

---

### 2️⃣ Node Worker

**Responsibilities**

* Scraping
* AI enrichment
* Async processing

**Flow**

```
Fetch pending article
→ Google Search (SerpAPI)
→ Scrape (Cheerio)
→ Rewrite (Gemini)
→ PUT to Laravel
```

**Rules**

* No DB access
* HTTP-only communication
* AI provider fully swappable

---

### 3️⃣ Frontend — React

**Responsibilities**

* Read-only UI
* Zero business logic

**Tech**

* React (Vite)
* TailwindCSS

**UI Rules**

* 200-char preview
* “Read more” per card
* Status badge: Pending / Processed

---

## 🔐 Environment Variables

### Laravel

```
DB_CONNECTION=pgsql
DB_HOST=...
DB_DATABASE=...
DB_USERNAME=...
DB_PASSWORD=...
```

### Worker

```
LARAVEL_API=...
SERP_API_KEY=...
GEMINI_API_KEY=...
```
### Node Worker Environment Variables

```env
# Base URL of the Laravel API
LARAVEL_API=https://server-bogs.onrender.com/api/articles(Deployed)

# SerpAPI – Google Search API
# Used for fetching search results during scraping
SERP_API_KEY=your_serpapi_key
# Reference: https://serpapi.com/
# Docs: https://serpapi.com/search-api

# Google Gemini API
# Used for AI-based article rewriting
GEMINI_API_KEY=your_gemini_api_key
# Reference: https://ai.google.dev/
# Docs: https://ai.google.dev/gemini-api

### React

```
VITE_API_BASE_URL=http://localhost:8000/api
```

`.env` files are never committed.

---

## 🚀 Deployment

| Component | Platform                  |
| --------- | ------------------------- |
| API       | Render 
| DB        | Neon                      |       
| Frontend  | Vercel         

---

## 🧠 Design Principles

* Strict separation of concerns
* API-only communication
* Horizontally scalable
* Debuggable in isolation
* Built like production, not a tutorial

---

**Status:** Stable foundation

🌐 Live: [https://beyond-chats-ten.vercel.app/](https://beyond-chats-ten.vercel.app/)
