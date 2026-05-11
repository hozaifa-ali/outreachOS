# OutreachOS — Full SaaS Architecture
### AI-Powered Cold Email & Multi-Channel Outreach Platform

---

## Table of Contents

1. [Product Vision](#1-product-vision)
2. [Feature Set](#2-feature-set)
3. [System Architecture](#3-system-architecture)
4. [Database Schema](#4-database-schema)
5. [Tech Stack](#5-tech-stack)
6. [Frontend Architecture & UI](#6-frontend-architecture--ui)
7. [Backend Services](#7-backend-services)
8. [AI Agent System](#8-ai-agent-system)
9. [Email Infrastructure](#9-email-infrastructure)
10. [Security & Compliance](#10-security--compliance)
11. [Billing & Multi-Tenancy](#11-billing--multi-tenancy)
12. [DevOps & Infrastructure](#12-devops--infrastructure)
13. [Agent Instructions](#13-agent-instructions)
14. [Roadmap](#14-roadmap)

---

## 1. Product Vision

**OutreachOS** is a premium B2B SaaS platform that enables sales teams, agencies, and growth hackers to run personalized, AI-driven outreach campaigns at scale. Users upload contact lists, choose from advanced templates, and deploy campaigns across Email, LinkedIn, SMS, and WhatsApp — all tracked in a unified inbox with real-time analytics.

### Core Value Props

- Upload any CSV/XLSX list → auto-enrich → auto-personalize → send at scale
- AI agents write, test, and optimize sequences autonomously
- Unified inbox: replies from all channels in one place
- Deliverability-first: warm-up, rotation, and spam-score analysis built in
- White-label ready for agencies

---

## 2. Feature Set

### 2.1 Contact Management

- **List Upload**: CSV, XLSX, Google Sheets sync, HubSpot/Salesforce import
- **Auto-Enrichment**: Pull company data, LinkedIn URLs, job titles, tech stack via Clearbit / Apollo API
- **Deduplication Engine**: Fuzzy match on email + domain to prevent duplicate outreach
- **Segmentation**: Tag-based, filter-based, AI-suggested segments ("decision makers at Series A startups")
- **Suppression Lists**: Global unsubscribe, bounced, competitor domains
- **GDPR Consent Tracking**: Consent source, timestamp, expiry per contact

### 2.2 Campaign Builder

- **Sequence Builder**: Drag-and-drop multi-step sequences (email → wait → LinkedIn → wait → SMS)
- **Format Selection**: Plain text, HTML branded, Newsletter, Cold email minimal, Follow-up variants
- **AI Copy Generator**: Enter goal + persona → AI drafts full sequence
- **Spintax Support**: `{Hi|Hello|Hey} {{first_name}}` for variation
- **A/B Testing**: Up to 5 variants per step, auto-winner selection by open/reply rate
- **Smart Scheduling**: Send in recipient's timezone, business hours only, throttle per mailbox
- **Condition Branching**: If opened → send X, if clicked → send Y, if no reply → send Z

### 2.3 Email Infrastructure

- **Mailbox Connections**: Gmail OAuth, Outlook OAuth, SMTP/IMAP, Google Workspace, Microsoft 365
- **Mailbox Rotation**: Spread sends across multiple mailboxes per campaign
- **Email Warm-Up**: Auto warm-up new mailboxes with real interactions (opt-in network)
- **Deliverability Dashboard**: SPF/DKIM/DMARC checker, spam score, blacklist monitor
- **Bounce Handling**: Auto-classify hard/soft, update contact status
- **Unsubscribe Link**: One-click unsubscribe injected, auto-processed

### 2.4 Personalization Engine

- **Liquid-style Variables**: `{{first_name}}`, `{{company}}`, `{{industry}}`, `{{custom_1}}`
- **AI Personalization Lines**: Auto-generate icebreakers from LinkedIn, company news, job posts
- **Dynamic Images**: Personalized first-line image with contact's name/logo
- **Conditional Blocks**: Show/hide content blocks based on contact attributes
- **Preview Mode**: See exactly what each recipient will receive before send

### 2.5 Unified Inbox

- **All-Channel Inbox**: Email replies, LinkedIn DMs, SMS replies in one thread view
- **AI Reply Classifier**: Auto-tag replies as Interested / Not Interested / Out of Office / Wrong Person
- **One-Click Actions**: Book meeting (Calendly embed), move to next stage, add to CRM
- **Snooze & Reminders**: Snooze threads, set follow-up reminders
- **Team Inbox**: Assign conversations to teammates, internal notes

### 2.6 Analytics & Reporting

- **Campaign Dashboard**: Sent, Delivered, Opens, Clicks, Replies, Bounces, Unsubscribes
- **Sequence Funnel**: Visual drop-off at each step
- **Mailbox Health**: Per-mailbox reputation score, send/receive ratio
- **AI Insights**: "Step 2 has 40% lower open rate — subject line is the likely cause"
- **Revenue Attribution**: Track leads → opportunities → closed deals if CRM connected
- **Export**: CSV, PDF report, Looker Studio connector

### 2.7 Integrations

- CRM: HubSpot, Salesforce, Pipedrive, Close, Zoho
- Calendar: Calendly, Cal.com, Google Calendar
- Enrichment: Apollo, Clearbit, Hunter.io, Snov.io
- Notifications: Slack, Teams (reply alerts, campaign milestones)
- Zapier / Make / n8n webhook support
- Native API + Swagger docs

### 2.8 Agency & White-Label Features

- Sub-account management (clients)
- White-label domain + logo + color scheme
- Client reporting portal (read-only shareable link)
- Usage-based billing pass-through to clients
- Team roles: Owner, Admin, Manager, Sender, Viewer

---

## 3. System Architecture

```
┌──────────────────────────────────────────────────────────────────────┐
│                          CLIENTS                                      │
│  Web App (Next.js)   Mobile App (React Native)   Browser Ext (Chrome)│
└──────────────┬───────────────────────────────────────────────────────┘
               │ HTTPS / WSS
┌──────────────▼───────────────────────────────────────────────────────┐
│                      API GATEWAY (Kong / AWS API GW)                  │
│          Auth · Rate Limiting · Request Routing · Logging             │
└──┬──────────┬──────────────┬───────────────────┬──────────────┬──────┘
   │          │              │                   │              │
┌──▼──┐  ┌───▼──┐  ┌────────▼──────┐  ┌────────▼──┐  ┌───────▼──────┐
│Auth │  │Users │  │  Campaign     │  │  Inbox    │  │  Analytics   │
│Svc  │  │ Svc  │  │  Service      │  │  Service  │  │  Service     │
│     │  │      │  │               │  │           │  │              │
│JWT  │  │Orgs  │  │ Sequences     │  │ Threads   │  │ ClickHouse   │
│OAuth│  │Plans │  │ Contacts      │  │ Replies   │  │ Aggregations │
└──┬──┘  └───┬──┘  └───────┬───────┘  └────┬──────┘  └──────┬───────┘
   │         │             │               │                 │
┌──▼─────────▼─────────────▼───────────────▼─────────────────▼────────┐
│                     MESSAGE BROKER (Apache Kafka)                     │
│  Topics: email.send · email.event · enrichment.request · ai.task     │
└──┬─────────────────────┬────────────────────────────────────┬────────┘
   │                     │                                    │
┌──▼──────────┐  ┌───────▼──────────┐              ┌─────────▼────────┐
│  Send       │  │  AI Agent        │              │  Enrichment      │
│  Workers    │  │  Orchestrator    │              │  Workers         │
│             │  │                  │              │                  │
│ SMTP Pool   │  │ Claude Sonnet    │              │ Clearbit/Apollo  │
│ Mailbox Rot │  │ Personalization  │              │ Hunter/Snov      │
│ Rate Limit  │  │ Reply Classify   │              │                  │
└──┬──────────┘  └───────┬──────────┘              └──────────────────┘
   │                     │
┌──▼─────────────────────▼─────────────────────────────────────────────┐
│                        DATA LAYER                                     │
│                                                                       │
│  PostgreSQL (primary)    Redis (cache/sessions)    S3 (files/assets)  │
│  ClickHouse (events)     Elasticsearch (search)    Vault (secrets)    │
└──────────────────────────────────────────────────────────────────────┘
```

### Architecture Decisions

| Decision | Choice | Reason |
|---|---|---|
| API style | REST + WebSocket | REST for CRUD, WS for live inbox/analytics |
| Microservices vs Monolith | Modular Monolith → extract when needed | Faster to ship, easy to split later |
| Queue | Kafka | High throughput email events, replay capability |
| Primary DB | PostgreSQL | ACID compliance for billing/contacts |
| Analytics DB | ClickHouse | Columnar, handles billions of email events |
| Cache | Redis | Session, rate limits, real-time counters |
| Search | Elasticsearch | Full-text contact/thread search |
| File Storage | S3-compatible | CSV uploads, attachments, assets |

---

## 4. Database Schema

### Core Tables (PostgreSQL)

```sql
-- Tenants (Organizations)
CREATE TABLE organizations (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  slug          TEXT UNIQUE NOT NULL,
  plan          TEXT NOT NULL DEFAULT 'starter',  -- starter|growth|pro|enterprise
  seats         INT NOT NULL DEFAULT 1,
  email_credits INT NOT NULL DEFAULT 1000,
  timezone      TEXT NOT NULL DEFAULT 'UTC',
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  white_label   JSONB  -- {domain, logo_url, primary_color, name}
);

-- Users
CREATE TABLE users (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id         UUID REFERENCES organizations(id) ON DELETE CASCADE,
  email          TEXT UNIQUE NOT NULL,
  full_name      TEXT,
  role           TEXT NOT NULL DEFAULT 'sender',  -- owner|admin|manager|sender|viewer
  avatar_url     TEXT,
  last_login_at  TIMESTAMPTZ,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- Contact Lists
CREATE TABLE contact_lists (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id     UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  source     TEXT,  -- csv_upload|google_sheets|hubspot|salesforce|manual
  total      INT DEFAULT 0,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Contacts
CREATE TABLE contacts (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id        UUID REFERENCES organizations(id) ON DELETE CASCADE,
  list_id       UUID REFERENCES contact_lists(id),
  email         TEXT NOT NULL,
  first_name    TEXT,
  last_name     TEXT,
  company       TEXT,
  title         TEXT,
  linkedin_url  TEXT,
  phone         TEXT,
  website       TEXT,
  industry      TEXT,
  custom_fields JSONB DEFAULT '{}',
  status        TEXT DEFAULT 'active',  -- active|unsubscribed|bounced|invalid
  enriched_at   TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(org_id, email)
);

-- Mailboxes (connected sending accounts)
CREATE TABLE mailboxes (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id         UUID REFERENCES organizations(id) ON DELETE CASCADE,
  email          TEXT NOT NULL,
  provider       TEXT NOT NULL,  -- gmail|outlook|smtp
  credentials    JSONB,          -- encrypted OAuth tokens or SMTP creds
  daily_limit    INT DEFAULT 50,
  warmup_enabled BOOLEAN DEFAULT FALSE,
  reputation     INT DEFAULT 100,  -- 0-100
  status         TEXT DEFAULT 'active',
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- Campaigns
CREATE TABLE campaigns (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id          UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  status          TEXT DEFAULT 'draft',  -- draft|scheduled|active|paused|completed|archived
  list_id         UUID REFERENCES contact_lists(id),
  schedule        JSONB,  -- {timezone, days, start_hour, end_hour, throttle_per_hour}
  track_opens     BOOLEAN DEFAULT TRUE,
  track_clicks    BOOLEAN DEFAULT TRUE,
  created_by      UUID REFERENCES users(id),
  launched_at     TIMESTAMPTZ,
  completed_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Sequence Steps
CREATE TABLE sequence_steps (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id   UUID REFERENCES campaigns(id) ON DELETE CASCADE,
  step_number   INT NOT NULL,
  type          TEXT NOT NULL,  -- email|linkedin_connect|linkedin_message|sms|wait
  delay_days    INT DEFAULT 0,
  subject       TEXT,
  body          TEXT,
  format        TEXT DEFAULT 'plain',  -- plain|html|newsletter|minimal
  variants      JSONB DEFAULT '[]',   -- A/B test variants
  condition     JSONB,  -- {trigger: 'opened'|'clicked'|'replied'|'no_reply'}
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Campaign Contacts (enrollment)
CREATE TABLE campaign_contacts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id     UUID REFERENCES campaigns(id) ON DELETE CASCADE,
  contact_id      UUID REFERENCES contacts(id) ON DELETE CASCADE,
  current_step    INT DEFAULT 1,
  status          TEXT DEFAULT 'enrolled',  -- enrolled|active|replied|finished|unsubscribed|bounced|failed
  enrolled_at     TIMESTAMPTZ DEFAULT NOW(),
  finished_at     TIMESTAMPTZ,
  UNIQUE(campaign_id, contact_id)
);

-- Sent Emails
CREATE TABLE sent_emails (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id       UUID REFERENCES campaigns(id),
  campaign_contact  UUID REFERENCES campaign_contacts(id),
  step_id           UUID REFERENCES sequence_steps(id),
  mailbox_id        UUID REFERENCES mailboxes(id),
  message_id        TEXT,  -- SMTP Message-ID header
  subject           TEXT,
  from_email        TEXT,
  to_email          TEXT,
  sent_at           TIMESTAMPTZ DEFAULT NOW(),
  status            TEXT DEFAULT 'sent'  -- sent|delivered|bounced|failed
);

-- Email Events (high volume — mirror to ClickHouse)
CREATE TABLE email_events (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sent_id     UUID REFERENCES sent_emails(id),
  org_id      UUID,
  campaign_id UUID,
  contact_id  UUID,
  event_type  TEXT NOT NULL,  -- open|click|reply|bounce|unsubscribe|spam_report
  metadata    JSONB,  -- {url, ip, user_agent, link_text}
  occurred_at TIMESTAMPTZ DEFAULT NOW()
);

-- Inbox Threads
CREATE TABLE inbox_threads (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id      UUID REFERENCES organizations(id) ON DELETE CASCADE,
  campaign_id UUID REFERENCES campaigns(id),
  contact_id  UUID REFERENCES contacts(id),
  channel     TEXT DEFAULT 'email',  -- email|linkedin|sms|whatsapp
  status      TEXT DEFAULT 'open',   -- open|closed|snoozed
  label       TEXT,  -- interested|not_interested|ooo|wrong_person|meeting_booked
  assigned_to UUID REFERENCES users(id),
  snoozed_until TIMESTAMPTZ,
  last_message_at TIMESTAMPTZ,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Thread Messages
CREATE TABLE thread_messages (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id   UUID REFERENCES inbox_threads(id) ON DELETE CASCADE,
  direction   TEXT NOT NULL,  -- inbound|outbound
  body        TEXT,
  html_body   TEXT,
  from_email  TEXT,
  to_email    TEXT,
  ai_summary  TEXT,
  sent_at     TIMESTAMPTZ DEFAULT NOW()
);

-- Templates Library
CREATE TABLE templates (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id      UUID REFERENCES organizations(id),  -- NULL = global/public
  name        TEXT NOT NULL,
  category    TEXT,  -- cold_outreach|follow_up|breakup|newsletter|demo_request
  format      TEXT DEFAULT 'plain',
  subject     TEXT,
  body        TEXT,
  thumbnail   TEXT,
  is_public   BOOLEAN DEFAULT FALSE,
  usage_count INT DEFAULT 0,
  created_by  UUID REFERENCES users(id),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Subscriptions & Billing
CREATE TABLE subscriptions (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id              UUID UNIQUE REFERENCES organizations(id) ON DELETE CASCADE,
  stripe_customer_id  TEXT,
  stripe_sub_id       TEXT,
  plan                TEXT NOT NULL,
  status              TEXT,  -- active|past_due|canceled|trialing
  current_period_end  TIMESTAMPTZ,
  email_quota         INT,
  seats_quota         INT,
  created_at          TIMESTAMPTZ DEFAULT NOW()
);
```

### ClickHouse Schema (Analytics)

```sql
-- High-volume event store
CREATE TABLE email_events_ch (
  event_id     UUID,
  org_id       UUID,
  campaign_id  UUID,
  contact_id   UUID,
  sent_id      UUID,
  event_type   LowCardinality(String),
  url          String,
  ip           IPv4,
  occurred_at  DateTime64(3, 'UTC'),
  date         Date MATERIALIZED toDate(occurred_at)
)
ENGINE = MergeTree()
PARTITION BY date
ORDER BY (org_id, campaign_id, occurred_at);

-- Pre-aggregated campaign stats (refreshed every 5 min)
CREATE MATERIALIZED VIEW campaign_stats_mv AS
SELECT
  campaign_id,
  toDate(occurred_at) AS date,
  countIf(event_type = 'open')        AS opens,
  countIf(event_type = 'click')       AS clicks,
  countIf(event_type = 'reply')       AS replies,
  countIf(event_type = 'bounce')      AS bounces,
  countIf(event_type = 'unsubscribe') AS unsubs,
  uniqIf(contact_id, event_type = 'open') AS unique_opens
FROM email_events_ch
GROUP BY campaign_id, date;
```

---

## 5. Tech Stack

### Frontend
| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| State | Zustand + React Query (TanStack) |
| Rich Text Editor | TipTap (email body editor) |
| Charts | Recharts + D3 |
| Drag & Drop | dnd-kit (sequence builder) |
| WebSockets | Socket.io client |
| Forms | React Hook Form + Zod |
| Tables | TanStack Table |
| File Upload | react-dropzone |
| Animations | Framer Motion |

### Backend
| Layer | Technology |
|---|---|
| Runtime | Node.js 22 (primary) + Python 3.12 (AI workers) |
| Framework | Fastify (REST API) |
| Auth | JWT + Refresh Tokens, OAuth2 (Google, Microsoft) |
| ORM | Prisma (PostgreSQL) |
| Queue | Kafka (Confluent Cloud or self-hosted) |
| Workers | BullMQ (job processing on Redis) |
| Email Send | Nodemailer + custom SMTP pool |
| Webhooks | svix (webhook delivery infrastructure) |
| Validation | Zod |

### Infrastructure
| Component | Technology |
|---|---|
| Cloud | AWS (primary) |
| Containers | Docker + Kubernetes (EKS) |
| CDN | CloudFront |
| Storage | S3 |
| PostgreSQL | RDS Aurora PostgreSQL |
| Redis | ElastiCache |
| ClickHouse | ClickHouse Cloud |
| Secrets | AWS Secrets Manager + HashiCorp Vault |
| Monitoring | Datadog (APM + logs + metrics) |
| Alerting | PagerDuty |
| IaC | Terraform |
| CI/CD | GitHub Actions |

### AI
| Component | Technology |
|---|---|
| LLM | Anthropic Claude 3.5 Sonnet |
| Embeddings | OpenAI text-embedding-3-small |
| Vector Store | pgvector (on PostgreSQL) |
| AI Framework | LangChain (Python workers) |
| Prompt Registry | Internal prompt versioning system |

---

## 6. Frontend Architecture & UI

### Page Structure

```
app/
├── (auth)/
│   ├── login/
│   ├── signup/
│   └── forgot-password/
├── (dashboard)/
│   ├── layout.tsx              ← Sidebar + topbar
│   ├── dashboard/              ← Home overview
│   ├── campaigns/
│   │   ├── page.tsx            ← Campaign list
│   │   ├── new/                ← Campaign wizard
│   │   └── [id]/
│   │       ├── overview/       ← Stats
│   │       ├── sequence/       ← Drag-drop builder
│   │       ├── contacts/       ← Enrolled contacts
│   │       └── settings/
│   ├── contacts/
│   │   ├── page.tsx            ← All contacts
│   │   ├── lists/              ← List management
│   │   └── import/             ← Upload wizard
│   ├── inbox/
│   │   └── page.tsx            ← Unified inbox
│   ├── templates/
│   │   └── page.tsx            ← Template library
│   ├── mailboxes/
│   │   └── page.tsx            ← Connected mailboxes
│   ├── analytics/
│   │   └── page.tsx            ← Global analytics
│   ├── integrations/
│   └── settings/
│       ├── workspace/
│       ├── team/
│       ├── billing/
│       └── api-keys/
```

### UI Design System

```
Design Tokens:
  Primary:    #6366F1  (Indigo 500) — calls to action
  Secondary:  #8B5CF6  (Violet 500) — accents
  Success:    #10B981  (Emerald 500)
  Danger:     #EF4444  (Red 500)
  Warning:    #F59E0B  (Amber 500)
  Neutral:    #0F172A → #F8FAFC  (Slate scale)

Typography:
  Heading:    Inter (700/600)
  Body:       Inter (400/500)
  Mono:       JetBrains Mono (code, IDs)

Spacing:      4px base grid
Radius:       8px cards, 6px inputs, 999px pills
Shadow:       Layered box-shadow system (sm/md/lg/xl)
Motion:       100ms ease-out micro, 200ms ease-in-out panels
```

### Key UI Components

#### Campaign Wizard (5 Steps)
```
Step 1: Name & Goal        → Campaign name, goal type (meetings/replies/clicks)
Step 2: Choose Contacts    → Pick list, apply filters, preview count
Step 3: Build Sequence     → Drag-drop steps, write/AI-generate copy per step
Step 4: Configure Sending  → Mailboxes, schedule, throttle, tracking settings
Step 5: Review & Launch    → Summary card, estimated completion, confirm send
```

#### Sequence Builder UI
- Canvas with swimlane-style step cards
- "+" button between steps (add email / wait / condition)
- Each step card: expandable, shows subject + preview text + stats (if live)
- Branch conditions shown as split paths
- A/B variants shown as stacked cards

#### Unified Inbox UI
- 3-column layout: Thread list | Thread view | Contact panel
- Color-coded labels (green=Interested, red=Not Interested, grey=OOO)
- AI summary chip at top of thread ("Contact seems interested, mentioned budget constraints")
- Quick-action bar: Reply · Archive · Assign · Book Meeting · Add to CRM

---

## 7. Backend Services

### API Service (Fastify)

```
src/
├── modules/
│   ├── auth/         (login, register, OAuth, refresh tokens)
│   ├── campaigns/    (CRUD, launch, pause, stats)
│   ├── contacts/     (CRUD, import, enrichment queue)
│   ├── sequences/    (steps, A/B, conditions)
│   ├── mailboxes/    (connect, test, rotation logic)
│   ├── inbox/        (threads, messages, assignments)
│   ├── analytics/    (aggregation queries to ClickHouse)
│   ├── templates/    (library, clone, categories)
│   ├── billing/      (Stripe webhooks, plan enforcement)
│   ├── webhooks/     (outbound, inbound parsing)
│   └── ai/           (proxy to AI workers)
├── shared/
│   ├── kafka/        (producer/consumer setup)
│   ├── redis/        (cache helpers, rate limiters)
│   ├── email/        (SMTP pool, send helper)
│   ├── auth/         (JWT middleware, RBAC guards)
│   └── errors/       (AppError classes, handler)
```

### Send Worker

```
Consumer: kafka topic `email.send`

For each job:
  1. Load campaign_contact + current step
  2. Check contact status (not unsubscribed/bounced)
  3. Render template (replace variables, apply spintax)
  4. Select least-used mailbox from rotation pool
  5. Check mailbox daily limit → if exceeded, requeue for next window
  6. Add tracking pixel (open) + wrap links (click)
  7. Send via SMTP (Nodemailer)
  8. Record sent_emails row
  9. Publish email.event { type: 'sent' }
 10. Schedule next step job (delay_days from step config)
```

### Enrichment Worker

```
Consumer: kafka topic `enrichment.request`

For each contact batch:
  1. Check cache (Redis) for existing enrichment by domain/email
  2. Call Clearbit Enrichment API → fill company fields
  3. Call Apollo for phone/LinkedIn if missing
  4. Update contacts table
  5. Trigger AI personalization if campaign is already configured
```

### Inbound Email Parser

```
Provider: Mailgun Inbound Routes / SendGrid Inbound Parse
Endpoint: POST /webhooks/inbound-email

Processing:
  1. Parse raw MIME (headers, text, html)
  2. Match Message-ID / In-Reply-To to sent_emails
  3. Identify campaign + contact
  4. Create/update inbox_thread + thread_message
  5. Publish email.event { type: 'reply' }
  6. Trigger AI reply classifier (async)
  7. Send real-time WS push to assigned user's inbox
  8. Send Slack notification if configured
```

---

## 8. AI Agent System

### Agent Architecture

```
┌─────────────────────────────────────────────────────┐
│                 AI Orchestrator                      │
│           (Python / LangChain / FastAPI)             │
├──────────────┬──────────────┬───────────────────────┤
│  Copywriter  │  Classifier  │   Insight             │
│  Agent       │  Agent       │   Agent               │
│              │              │                        │
│ Generate     │ Label reply  │ Analyze campaign       │
│ sequences    │ intent       │ performance            │
│ Personalize  │              │ Suggest optimizations  │
│ icebreakers  │              │                        │
└──────────────┴──────────────┴───────────────────────┘
```

### Agent 1 — Copywriter Agent

**Trigger**: User clicks "AI Generate" in sequence builder, or new contact list uploaded with AI-personalize enabled.

**Input**:
```json
{
  "goal": "Book a 15-minute discovery call",
  "product": "CRM software for mid-market SaaS",
  "persona": "VP of Sales at 50-200 person B2B SaaS company",
  "tone": "conversational",
  "sequence_length": 4,
  "contact": {
    "first_name": "Sarah",
    "company": "Acme Corp",
    "title": "VP of Sales",
    "linkedin_headline": "Scaling sales at Acme | ex-Salesforce",
    "recent_news": "Acme raised $12M Series A last month"
  }
}
```

**Output**: Full JSON sequence (subject + body per step, wait days, send conditions)

**Prompt Strategy**:
- System: Role as expert B2B copywriter, constraints (no buzzwords, <150 words/email, value-first)
- Few-shot examples of high-performing cold emails
- Chain-of-thought: analyze persona → identify pain points → map to product value props → write

### Agent 2 — Reply Classifier Agent

**Trigger**: New inbound email parsed (real-time, <2s target latency)

**Input**: Raw email body text (stripping signatures)

**Output**:
```json
{
  "label": "interested",
  "confidence": 0.94,
  "reason": "Prospect asked to schedule a call and mentioned specific pain point",
  "suggested_action": "book_meeting",
  "sentiment_score": 0.72
}
```

**Labels**: `interested` | `not_interested` | `out_of_office` | `wrong_person` | `referral` | `question` | `unsubscribe_request`

### Agent 3 — Insight Agent

**Trigger**: Campaign running >3 days with >100 sent emails (scheduled, runs every 6h)

**Input**: Campaign stats aggregation from ClickHouse + sequence step content

**Output**: Natural-language insights array:
```json
[
  {
    "type": "warning",
    "message": "Step 2 open rate (18%) is 40% below your average. The subject line 'Following up' may be triggering spam filters.",
    "action": "edit_step",
    "step_id": "abc123"
  },
  {
    "type": "success",
    "message": "The icebreaker mentioning Series A funding is generating 3x replies vs your baseline.",
    "action": null
  }
]
```

### Agent 4 — Personalization Agent

**Trigger**: Batch job after contact enrichment completes

**Input**: Contact profile (title, company, LinkedIn, news)

**Output**: Per-contact personalization line (first line of email, 1-2 sentences):
```
"Congrats on Acme's Series A — scaling a sales org through that kind of growth is exciting and demanding at the same time."
```

---

## 9. Email Infrastructure

### Mailbox Rotation Algorithm

```python
def select_mailbox(campaign_id: str, org_id: str) -> Mailbox:
    mailboxes = get_active_mailboxes(org_id, campaign_id)
    
    for box in sorted(mailboxes, key=lambda m: m.sent_today):
        if box.sent_today < box.daily_limit:
            if box.reputation > 60:  # skip damaged mailboxes
                return box
    
    raise NoAvailableMailboxError("All mailboxes at daily limit")
```

### Email Warm-Up System

- New mailbox starts at 5 emails/day, increases by 5/day up to configured limit
- Warm-up network: real inboxes in pool exchange emails, open them, move from spam to inbox
- Automatic pause if spam rate >0.3% or bounce rate >5%
- Warm-up score visible in Mailbox Health dashboard

### Deliverability Checks (Pre-Send)

1. SPF record validation for sending domain
2. DKIM signing key present
3. DMARC policy check
4. MX record lookup for recipient domain
5. Spam score test via SpamAssassin API
6. Subject line spam-word scan
7. Text:image ratio check for HTML emails
8. Unsubscribe link present
9. Sending domain not on major blacklists (MXToolbox API)

### Bounce Classification

| Code | Type | Action |
|---|---|---|
| 550, 551, 553 | Hard | Mark contact `bounced`, never retry |
| 421, 450, 451, 452 | Soft | Retry after 1h, max 3 attempts |
| 552, 554 | Content/Spam | Flag for review, pause mailbox |
| 5xx (other) | Hard | Mark bounced |

---

## 10. Security & Compliance

### Authentication

- Email + password (bcrypt, min 10 rounds)
- Google OAuth + Microsoft OAuth (SSO)
- SAML SSO (Enterprise plan)
- MFA (TOTP via Authenticator app)
- Session: JWT (15min) + Refresh Token (30 days, stored HttpOnly cookie)

### RBAC (Role-Based Access Control)

| Permission | Owner | Admin | Manager | Sender | Viewer |
|---|---|---|---|---|---|
| Billing & plan | ✅ | ❌ | ❌ | ❌ | ❌ |
| Manage team | ✅ | ✅ | ❌ | ❌ | ❌ |
| Create campaigns | ✅ | ✅ | ✅ | ✅ | ❌ |
| Launch campaigns | ✅ | ✅ | ✅ | ❌ | ❌ |
| View analytics | ✅ | ✅ | ✅ | ✅ | ✅ |
| Delete data | ✅ | ✅ | ❌ | ❌ | ❌ |
| API key management | ✅ | ✅ | ❌ | ❌ | ❌ |

### Data Security

- All data encrypted at rest (AES-256) and in transit (TLS 1.3)
- Mailbox OAuth tokens encrypted with per-org key in Vault
- SMTP passwords encrypted, never logged
- Contact PII masked in logs
- API keys hashed (SHA-256), never stored in plain text
- Database: Row-Level Security (RLS) enforced via `org_id` on all tables
- Audit log: all data mutations recorded with user + timestamp

### GDPR / CAN-SPAM / CASL Compliance

- One-click unsubscribe link required on all outbound emails (enforced by send worker)
- Global suppression list per org (auto-processed from unsubscribe clicks)
- Contact data deletion (right to erasure): full wipe within 72h via API
- Data processing agreement (DPA) available for Enterprise
- Consent tracking: source + timestamp stored per contact
- US physical address required in email footer (CAN-SPAM)
- Email header `List-Unsubscribe` injected automatically

### Rate Limiting

- API: 1000 req/15min per org (Redis sliding window)
- Login: 10 attempts/15min per IP (progressively locked)
- Import: 3 uploads/hour per org
- AI generation: 100 requests/day on Starter, unlimited on Pro+

---

## 11. Billing & Multi-Tenancy

### Plans

| Feature | Starter | Growth | Pro | Enterprise |
|---|---|---|---|---|
| Price | $49/mo | $149/mo | $399/mo | Custom |
| Seats | 1 | 5 | 20 | Unlimited |
| Emails/month | 2,500 | 10,000 | 50,000 | Custom |
| Mailboxes | 2 | 10 | Unlimited | Unlimited |
| AI credits | 50 | 500 | 2,000 | Unlimited |
| Campaigns | 3 | 20 | Unlimited | Unlimited |
| A/B Testing | ❌ | ✅ | ✅ | ✅ |
| White Label | ❌ | ❌ | ✅ | ✅ |
| SAML SSO | ❌ | ❌ | ❌ | ✅ |
| SLA | ❌ | ❌ | 99.9% | 99.99% |
| Priority Support | ❌ | Email | Email+Chat | Dedicated CSM |

### Stripe Integration

- Subscription management: Stripe Billing
- Usage metering: Stripe Meters (email_sent events reported hourly)
- Overage: auto-charge at $0.002/email over plan quota
- Trial: 14-day free trial, no credit card required
- Proration: handled by Stripe on plan upgrades
- Invoice PDF available in billing settings
- Stripe Checkout for self-serve sign-up

### Multi-Tenancy Enforcement

- Every database query scoped by `org_id` via Prisma middleware
- Kafka events tagged with `org_id` for consumer filtering
- S3 paths prefixed with `/{org_id}/`
- Redis keys prefixed with `org:{org_id}:`
- Separate Elasticsearch index per org (data isolation)

---

## 12. DevOps & Infrastructure

### Environments

| Environment | Purpose | Data |
|---|---|---|
| `development` | Local (Docker Compose) | Seeded test data |
| `staging` | PR previews + QA | Anonymized prod subset |
| `production` | Live | Real customer data |

### Kubernetes (EKS) Services

```yaml
Deployments:
  - api-service           (3 replicas, HPA 3-15)
  - send-worker           (5 replicas, HPA 5-50 based on Kafka lag)
  - ai-worker             (2 replicas, GPU node group)
  - enrichment-worker     (2 replicas)
  - inbound-parser        (2 replicas)
  - websocket-server      (2 replicas, sticky sessions)
  - scheduler             (1 replica, cron jobs)

CronJobs:
  - warmup-sender         (every 30min)
  - analytics-aggregator  (every 5min)
  - bounce-processor      (every 1h)
  - deliverability-check  (every 6h)
  - insight-generator     (every 6h)
  - billing-usage-report  (every 1h → Stripe Meters)
```

### CI/CD Pipeline (GitHub Actions)

```
PR opened:
  → lint + type-check + unit tests
  → Docker build (cache layers)
  → Deploy to staging (PR preview URL)
  → Run E2E tests (Playwright)
  → Lighthouse score check

Merge to main:
  → Build + tag Docker image
  → Push to ECR
  → Apply Terraform changes
  → Rolling deploy to production (canary 10% → 100%)
  → Run smoke tests
  → Notify Slack
```

### Observability

- **Metrics**: Datadog APM + custom metrics (emails_sent/s, reply_rate, queue_depth)
- **Logs**: Structured JSON → Datadog Log Management
- **Traces**: Distributed tracing across API → Kafka → workers
- **Uptime**: Checkly synthetic monitoring (API + UI critical paths)
- **Errors**: Sentry (frontend + backend)
- **Dashboards**: Datadog dashboards for each service
- **Alerts**: PagerDuty for P1 (send failure >5%, API error rate >1%, queue depth >10k)

### Disaster Recovery

- RDS: Multi-AZ, automated daily snapshots (30-day retention), point-in-time recovery
- S3: Cross-region replication (us-east-1 → us-west-2)
- Redis: Multi-AZ ElastiCache with auto-failover
- RTO target: 1 hour | RPO target: 15 minutes
- Runbook: documented in Notion, tested quarterly

---

## 13. Agent Instructions

> These are the system-level instructions for each AI agent operating in OutreachOS. Paste these into the system prompt of your LLM calls.

---

### 13.1 Copywriter Agent System Prompt

```
You are an elite B2B cold email copywriter with 15 years of experience writing sequences that generate replies from C-suite and VP-level executives.

CORE PRINCIPLES:
- Write like a human, never like a marketer. No jargon, no buzzwords, no "hope this email finds you well."
- Lead with value or a relevant observation, never with "my name is X and I work at Y."
- Every email must have ONE clear call to action. Not two. Not zero.
- Keep emails under 150 words. Shorter is almost always better.
- Use the contact's context (company news, job title, tech stack) to make each email feel written specifically for them.
- Never use exclamation points. Never use all-caps. Never start a sentence with "I."

OUTPUT FORMAT:
Return a JSON array of sequence steps. Each step must have:
- step_number (int)
- type: "email" | "wait"
- delay_days (int, 0 for first step)
- subject (string, max 8 words, no clickbait)
- body (string, plain text, use {{first_name}} for personalization)
- send_condition: "always" | "if_no_open" | "if_no_reply" | "if_opened"
- variant_b (object with alternate subject+body for A/B, optional)

SEQUENCE STRUCTURE (default 4-step):
Step 1: Day 0 — Primary email. Personalized opening + one clear value prop + soft CTA ("worth a quick chat?")
Step 2: Day 3 — Add-value follow-up. Share a relevant insight, case study stat, or question. No "just following up."
Step 3: Day 7 — Different angle. Reframe the value prop from a different pain point or use case.
Step 4: Day 12 — Breakup email. Light, honest, short. Leave the door open.

NEVER:
- Write more than 4 steps without explicit instruction
- Include attachments or links (unless product demo URL explicitly provided)
- Make claims you cannot verify ("we help companies like yours 10x their revenue")
- Use deceptive subject lines ("Re:" when there's no prior thread)
```

---

### 13.2 Reply Classifier Agent System Prompt

```
You are a reply intent classifier for a B2B sales outreach platform. Your job is to read an inbound email reply and classify the prospect's intent accurately.

CLASSIFICATION LABELS (choose exactly one):
- "interested": Prospect wants to learn more, asked a question, requested a demo/call, or showed positive engagement
- "not_interested": Prospect explicitly declined, asked to stop contact, or is clearly not a fit
- "out_of_office": Auto-reply or manual OOO message. Not a real reply from the prospect.
- "wrong_person": Reply indicates this is the wrong contact (e.g., "I'm not in charge of this, please contact...")
- "referral": Prospect referred you to another person at their company
- "question": Prospect asked a clarifying question but has not committed to interest or rejection
- "unsubscribe_request": Any explicit request to stop receiving emails (even if politely phrased)

OUTPUT FORMAT — respond ONLY with valid JSON, no prose:
{
  "label": "<label>",
  "confidence": <0.0-1.0>,
  "reason": "<one sentence explaining your classification>",
  "suggested_action": "<book_meeting|reply_with_info|add_to_crm|mark_closed|reassign|unsubscribe|none>",
  "sentiment_score": <-1.0 to 1.0>,
  "key_quote": "<most relevant sentence from the reply, max 20 words>"
}

IMPORTANT RULES:
- If ANY part of the reply asks to stop receiving emails, classify as "unsubscribe_request" regardless of other content.
- OOO messages should be classified as "out_of_office" even if they mention forwarding to a colleague.
- If confidence is below 0.7, set suggested_action to "none" and let a human review.
- Do not hallucinate intent. If it's ambiguous, classify as "question."
```

---

### 13.3 Personalization Agent System Prompt

```
You are a world-class B2B sales personalization engine. Your job is to write a single personalized opening line for a cold email based on the contact's profile.

The opening line should:
- Be 1-2 sentences maximum
- Reference something specific and real about the prospect (recent company news, their role/background, a mutual connection, a public post, a job opening at their company, a product launch)
- Feel genuinely human — like something a thoughtful salesperson noticed, not something a bot generated
- NOT mention the sender's product or company
- NOT be a generic compliment ("I love what you're doing at Acme!")
- Connect emotionally to the prospect's current situation or challenge

INPUT: You will receive a JSON object with contact fields. Use whatever fields are available.

OUTPUT: Return ONLY the personalized line as a plain text string. No JSON wrapper, no quotes, no explanation. Just the line.

EXAMPLES OF GOOD LINES:
- "Saw Acme just opened 3 SDR roles last week — scaling outbound in a competitive market is no small lift."
- "Congrats on the Series B — going from 20 to 200 people in 18 months sounds exciting and chaotic in equal measure."
- "Your post on LinkedIn about moving away from activity-based metrics resonated — most VP Sales I talk to are wrestling with the same shift."

EXAMPLES OF BAD LINES (never write these):
- "I came across your profile and was impressed by your experience." ❌
- "As a leader in the SaaS space..." ❌
- "Hope you're having a great week!" ❌
- "I noticed you work at Acme Corp." ❌

If no meaningful personalization data is available, respond with: __SKIP__
```

---

### 13.4 Insight Agent System Prompt

```
You are a campaign performance analyst for an email outreach platform. You receive campaign statistics and sequence copy, and your job is to produce actionable, specific insights that help sales teams improve their results.

INPUT: JSON object containing:
- campaign_name, campaign_goal
- overall_stats: {sent, delivered, open_rate, click_rate, reply_rate, bounce_rate, unsubscribe_rate}
- step_stats: array of per-step metrics
- step_content: array of subject lines + body previews
- benchmark: industry averages for context

OUTPUT FORMAT — return a JSON array of insight objects:
[
  {
    "type": "warning" | "success" | "tip" | "critical",
    "title": "<short title, max 8 words>",
    "message": "<specific, actionable insight, 1-3 sentences>",
    "metric": "<the metric this relates to, e.g. 'Step 2 Open Rate'>",
    "value": "<the current value, e.g. '14%'>",
    "benchmark": "<the expected value, e.g. '32%'>",
    "action": "<action slug or null>",
    "action_label": "<button label or null>"
  }
]

RULES:
- Be specific. Never say "your open rate is low." Say which step, by how much, and what likely caused it.
- Reference the actual subject lines and copy when diagnosing problems.
- Suggest concrete fixes ("Try removing 'follow up' from your Step 2 subject line")
- Mark bounce rate >5% or unsubscribe rate >0.5% as "critical"
- If campaign is performing above benchmark on all metrics, produce 1-2 "success" insights
- Maximum 6 insights per response. Prioritize the most impactful.
- Do not make up statistics. Only use the numbers provided in the input.
```

---

### 13.5 Subject Line Optimizer Agent System Prompt

```
You are a subject line optimization specialist. Given an existing email subject line and campaign performance data, you generate 5 alternative subject line variants to A/B test.

GOOD SUBJECT LINES:
- Sound like internal emails ("Quick question about your outbound")
- Are specific but mysterious ("The gap in your {company} sales process")
- Reference the recipient ("{{first_name}}, saw this and thought of you")
- Are genuinely short (2-6 words often outperform longer ones)

BAD SUBJECT LINES:
- Clickbait ("You won't believe this ROI")
- Vague ("Checking in")
- Aggressive ("Last chance!")
- Corporate ("Partnership opportunity for {{company}}")

OUTPUT: JSON array of 5 subject line strings, ranked by predicted performance (highest first).
Include a one-sentence rationale after each as a separate "rationale" field.

Each variant should test a different approach:
1. Ultra-short (2-3 words)
2. Personalized with variable
3. Question format
4. Curiosity/pattern interrupt
5. Direct value statement
```

---

## 14. Roadmap

### Phase 1 — MVP (Months 1-3)
- [ ] Auth + org + user management
- [ ] Contact import (CSV) + basic enrichment
- [ ] Campaign builder (email only, no branching)
- [ ] Mailbox connection (Gmail + Outlook OAuth)
- [ ] Basic sequence builder (up to 5 steps)
- [ ] Send worker + open/click tracking
- [ ] Simple inbox (email replies only)
- [ ] Campaign dashboard (basic stats)
- [ ] Stripe billing (3 plans)

### Phase 2 — Growth (Months 4-6)
- [ ] AI copy generation (Copywriter Agent)
- [ ] AI reply classification (Classifier Agent)
- [ ] A/B testing
- [ ] Conditional branching in sequences
- [ ] Mailbox warm-up system
- [ ] Deliverability dashboard
- [ ] HubSpot + Salesforce integration
- [ ] Team inbox + assignments
- [ ] White-label (Pro plan)

### Phase 3 — Scale (Months 7-12)
- [ ] LinkedIn outreach channel
- [ ] SMS channel (Twilio)
- [ ] AI personalization lines (batch)
- [ ] Insight Agent (campaign analytics AI)
- [ ] Sub-account management (Agency plan)
- [ ] SAML SSO (Enterprise)
- [ ] Chrome extension (LinkedIn scrape + 1-click enroll)
- [ ] Native mobile app (React Native)
- [ ] Zapier + Make integration
- [ ] Public API + developer docs

### Phase 4 — AI-First (Year 2)
- [ ] Autonomous campaign manager ("Set goal, AI runs the campaign")
- [ ] Predictive send time optimization per contact
- [ ] AI-powered contact scoring (likelihood to reply)
- [ ] Voice outreach integration (ElevenLabs + Bland AI)
- [ ] Auto-meeting scheduling (AI books calls from reply)
- [ ] Revenue attribution modeling
- [ ] Competitive intelligence layer (monitor prospects' news)

---

*Document version: 1.0 | OutreachOS SaaS Architecture*
*Generated for internal engineering, product, and AI team use.*
