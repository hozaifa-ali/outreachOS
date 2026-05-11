<div align="center">
  <img src="https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/zap.svg" width="80" height="80" alt="OutreachOS Logo" />
  <h1 align="center">OutreachOS</h1>
  <p align="center"><strong>The Ultimate AI-Powered B2B Outbound Platform</strong></p>
  <p align="center">
    <a href="https://nextjs.org/"><img src="https://img.shields.io/badge/Next.js-15-black?style=flat&logo=next.js" alt="Next.js" /></a>
    <a href="https://fastify.dev/"><img src="https://img.shields.io/badge/Fastify-Backend-white?style=flat&logo=fastify" alt="Fastify" /></a>
    <a href="https://www.postgresql.org/"><img src="https://img.shields.io/badge/PostgreSQL-Database-336791?style=flat&logo=postgresql" alt="Postgres" /></a>
    <a href="https://clickhouse.com/"><img src="https://img.shields.io/badge/ClickHouse-Analytics-FFCC00?style=flat&logo=clickhouse" alt="ClickHouse" /></a>
    <a href="https://tailwindcss.com/"><img src="https://img.shields.io/badge/TailwindCSS-v4-38B2AC?style=flat&logo=tailwind-css" alt="Tailwind CSS" /></a>
  </p>
</div>

<hr />

## 🚀 Overview

**OutreachOS** is a next-generation SaaS platform designed to put your B2B sales motion on autopilot. Built with a modern, high-performance monorepo architecture, OutreachOS combines the scalability of **Fastify** and **PostgreSQL** with the stunning, glassmorphic UI of **Next.js 15**.

But what truly sets OutreachOS apart is its intelligence. Powered by **Anthropic Claude 3.5**, the platform features five autonomous AI agents that write hyper-personalized copy, optimize subject lines, and automatically classify inbox replies—allowing your team to stop typing and start closing.

## ✨ Key Features

- **🤖 Autonomous AI Agents:** Deep integration with Claude to write copy, analyze LinkedIn profiles, and classify inbound intent.
- **⚡ Smart Sequencing:** Build complex multi-step automated sequences with intelligent branching and A/B testing.
- **📊 Real-Time Analytics:** Powered by ClickHouse to track opens, clicks, and replies across millions of events with sub-second latency.
- **📬 Unified Inbox:** Manage conversations across multiple mailboxes from a single, beautifully designed interface.
- **🛡️ Enterprise Security:** AES-256-GCM encryption for all mailbox credentials and strict Row-Level Security (RLS) for multi-tenancy.
- **🎨 Stunning UI:** A highly polished, responsive, glassmorphic frontend utilizing Framer Motion and Tailwind CSS.

## 🏗️ Architecture

OutreachOS utilizes a **Turborepo** monorepo structure to share types, schemas, and configurations across the entire stack:

- **`apps/web`**: Next.js 15 App Router frontend (Tailwind, Zustand, TanStack Query).
- **`apps/api`**: Fastify Node.js backend exposing REST APIs.
- **`apps/workers`**: BullMQ and Redis-based workers for background email sending and data enrichment.
- **`apps/ai`**: Python FastAPI microservice wrapping the Anthropic Claude SDK for AI generation.
- **`packages/db`**: Global Prisma client and PostgreSQL schema definition.
- **`packages/shared`**: Shared TypeScript types, Zod schemas, and encryption utilities.

## 🛠️ Getting Started

### Prerequisites
- Node.js 22+
- pnpm (v9+)
- Docker & Docker Compose
- Anthropic API Key (for the AI Service)

### 1. Environment Setup

Clone the repository and install all workspace dependencies:

```bash
git clone https://github.com/hozaifa-ali/outreachOS.git
cd outreachos
pnpm install
```

Copy the `.env.example` file to `.env` in the root directory and populate your credentials:

```bash
cp .env.example .env
```

### 2. Infrastructure Boot

Start the local infrastructure (PostgreSQL, Redis, ClickHouse, and MailHog) using Docker Compose:

```bash
docker-compose up -d
```

Push the database schema to PostgreSQL:

```bash
pnpm --filter @outreachos/db run db:push
```

### 3. Launch the Platform

Start all applications (Web, API, Workers, and AI service) simultaneously using Turborepo:

```bash
pnpm dev
```

- **Frontend Application:** [http://localhost:3000](http://localhost:3000)
- **API Server:** [http://localhost:8080](http://localhost:8080)
- **AI Microservice:** [http://localhost:8000](http://localhost:8000)
- **MailHog (Local SMTP testing):** [http://localhost:8025](http://localhost:8025)

## 🧪 Continuous Integration

This project uses **GitHub Actions** to automatically run type-checking and build verification across the monorepo on every push to the `main` branch. See `.github/workflows/ci.yml` for details.

## 📄 License

OutreachOS is proprietary software. All rights reserved.
