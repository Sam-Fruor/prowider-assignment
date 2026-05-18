```markdown
# 📦 Book My Packers — Enterprise Lead Distribution System

An enterprise-grade, concurrency-safe, real-time lead generation and distribution engine designed for **Book My Packers**. This system automates the intake of customer moving requests and instantly assigns them to logistics providers based on strict business logic rules, fair-share round-robin distribution, and absolute quota management.

Built with performance, consistency, and data integrity at its core, this application gracefully handles extreme concurrent traffic, prevents race conditions, and guarantees webhook idempotency at the database layer.

---

## 🚀 Live Demo & Project Assets
*   **Live Application URL:** `https://prowider-assignment-three.vercel.app/`
*   **GitHub Repository:** `https://github.com/Sam-Fruor/prowider-assignment`

---

## 🛠️ Tech Stack & Architecture

*   **Frontend Framework:** Next.js (App Router, Client/Server Components)
*   **Database Engine:** PostgreSQL hosted on Supabase (Relational, ACID Compliant)
*   **ORM Layer:** Prisma ORM (Type-safe client generation & data mapping)
*   **Real-Time Data Layer:** SWR (Stale-While-Revalidate lightweight client-side polling)
*   **Styling & UI Componentry:** Tailwind CSS (CDN-delivered utility-first presentation framework)
*   **Visual Enhancements:** Lucide React Icons & React Hot Toast notifications

```text
prowider-assignment/
├── app/
│   ├── api/
│   │   ├── providers/
│   │   │   └── route.ts         # Fetches real-time provider matrix with nested relational assignments
│   │   ├── request-service/
│   │   │   └── route.ts         # Core Allocation Engine & Database Transaction Layer
│   │   └── webhook/
│   │       └── reset-quota/     # Idempotent entrypoint for subscription webhook simulations
│   ├── dashboard/
│   │   └── page.tsx             # Real-time SaaS interface tracking provider activity
│   ├── request-service/
│   │   └── page.tsx             # Dynamic client enquiry form with deep validation routing
│   ├── test-tools/
│   │   └── page.tsx             # Visual simulation panel testing concurrency/idempotency
│   ├── icon.tsx                 # Dynamic SVG asset generating system favicon
│   └── layout.tsx               # Global wrapper injecting brand layout and Toast configuration
├── prisma/
│   ├── schema.prisma            # Strict entity relationship relational models
│   └── seed.ts                  # Autonomous script validating initial environment seed data

```

---

## ⚙️ Local Installation & Environment Setup

Follow these precise steps to execute the application and run high-concurrency simulation suites locally:

### 1. Clone the Codebase & Pull Dependencies

```bash
git clone <your-repository-url>
cd prowider-assignment
npm install

```

### 2. Configure Local Environment Variables

Create a `.env` file in the root directory of your project. Insert your Supabase database connection string.

> ⚠️ **CRUCIAL CONNECTION DESIGN:** For local schema configuration or data seeding, connect directly via port `5432`. For heavy production runtime, concurrency testing, and Vercel deployment, utilize the **Transaction Pooler URL (Port 6543)** with connection limits enforced to maximize database capability.

```env
# Example using Direct Port (5432) for setup:
DATABASE_URL="postgresql://postgres.ulcogejmcpzwcpomcers:[YOUR-PASSWORD]@[aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres](https://aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres)"

# Example using Transaction Pooler (6543) for Vercel/Concurrency:
# DATABASE_URL="postgresql://postgres.ulcogejmcpzwcpomcers:[YOUR-PASSWORD]@[aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1](https://aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1)"

```

### 3. Generate Client & Provision Database Schema

Sync your Prisma schemas directly with your active database engine and populate initial lookup structures.

```bash
npx prisma db push
npx prisma generate
npx tsx prisma/seed.ts

```

*Your terminal should confirm: `Database seeded with Services and Providers!*`

### 4. Boot Up the Next.js Development Server

```bash
npm run dev

```

Open [http://localhost:3000](https://www.google.com/search?q=http://localhost:3000) in your web browser to access the active interface.

---

## 🧠 Deep-Dive: Core Backend Engineering Choices

### 1. The Multi-Tier Lead Allocation Algorithm

The engine processes incoming lead allocation requests deterministically, guaranteeing that every customer inquiry links to exactly three separate providers without overlaps:

| Requested Service Type | Phase 1: Mandatory Provider Priority | Phase 2: Fair Distribution Rotation Pool |
| --- | --- | --- |
| **Service 1 (Packing)** | Provider 1 | Providers 2, 3, 4 |
| **Service 2 (Moving)** | Provider 5 | Providers 6, 7, 8 |
| **Service 3 (Storage)** | Provider 1 & Provider 4 | Providers 2, 3, 5, 6, 7, 8 |

* **Priority Execution:** The transaction isolates the requested `serviceId` and attempts to assign the mandated partners first. If they have available quota, they receive the assignment.
* **Round-Robin Pointer Tracking:** If further slots are required to meet the 3-provider target, the algorithm reads the persistent `lastProviderId` value associated with that service from the `AllocationState` table. It loops sequentially through the pool candidates, evaluating remaining quotas, and updates the pointer instantly upon allocation.

### 2. High-Concurrency Defenses & Race-Condition Isolation

Under parallel volume testing (e.g., shooting 10 leads at the same millisecond), standard backend logic allows *Time of Check to Time of Use (ToCToU)* bugs where multiple threads read identical provider metrics simultaneously, causing negative quotas and clumped round-robin values. This application eliminates race conditions via database isolation patterns:

* **Pessimistic Row-Level Locking (`FOR UPDATE`):** Upon transaction initialization, the engine executes a raw SQL `SELECT * FROM "AllocationState" WHERE "serviceId" = $1 FOR UPDATE` lock. This blocks concurrent requests from reading or changing the pointer index simultaneously, organizing multi-thread execution into a disciplined, sequential line.
* **Atomic Quota Resource Claims:** Instead of checking a provider's capacity in memory and mutating it afterward, the system executes an atomic `updateMany` modification governed by a database-level query filter: `where: { id: providerId, quota: { gt: 0 } }`. If the target provider's quota has reached zero, the database updates zero records, immediately alerting the engine to hop to the next round-robin candidate. Quotas can never drop below zero.

### 3. Mathematical Webhook Idempotency Guardrails

To simulate payment gateway callbacks securely, the system addresses API repetition using an **Idempotency Key pattern**:

* The `/api/webhook/reset-quota` route requires an incoming unique `eventId`.
* Before adjusting provider allocations, the backend attempts to write the key into the `ProcessedWebhook` database model. Because `eventId` acts as a primary unique key, duplicate network messages or rapid button clicks fail constraint checks instantly.
* The engine flags the unique index constraint breach (`P2002`), stops downstream code execution, and returns a graceful `200 OK` status confirming the event has already been successfully handled.

---

## 🖥️ System Walkthrough & Feature Breakdown

### 👤 Public Customer Enquiry Form (`/request-service`)

* **Purpose:** Allows users to request specific packing/moving requirements.
* **Data Integrity Guardrails:** The interface enforces a strict 10-digit text mask on the mobile number input to normalize entries.
* **Database Double-Submit Block:** Backed by an explicit database-level composite unique constraint `@@unique([phone, serviceId])`. The same customer cannot request the identical service category more than once, returning immediate real-time feedback using toast notifications if attempted.

### 📊 Real-Time Monitoring Center (`/dashboard`)

* **Purpose:** Provides a centralized, live overview of logistics providers.
* **Live Updates Architecture:** Eliminates heavy resource overhead like WebSockets by utilizing lightweight `useSWR` client polling loops mapped to a 3000ms cadence.
* **UI Indicators:** Features real-time visual progress bars tracking depleted quotas, responsive item list transformations, dynamic state counters, and designated "Inbox Zero" states if a provider's queue is completely clear.

### 🧪 Developer Testing & Simulation Panel (`/test-tools`)

* **Purpose:** Intentionally stress-tests the backend constraints and isolates execution metrics.
* **Available Actions:**
1. *Reset Quota via Webhook:* Simulates incoming transactional payment requests resetting targeted provider pipelines.
2. *Test Idempotency:* Fires three identical webhook objects to the server in parallel to demonstrate automated verification.
3. *Fire 10 Concurrent Leads:* Simulates intense server load by wrapping ten separate customer profiles into a parallel `Promise.all()` framework, demonstrating row-locking behavior and fair-share rotation visually.


* **Log View:** A simulated embedded server terminal stream records network activities and database response codes live.
