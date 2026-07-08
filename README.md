# 🎯 The Academic Curator — Vulnerable E-Learning Platform

> **⚠️ WARNING: This application is INTENTIONALLY VULNERABLE. It is designed for authorized security training, penetration testing labs, and CTF exercises ONLY. DO NOT deploy in production or on any public-facing network.**

---

## Overview

**The Academic Curator** is a full-featured e-learning platform built with a modern tech stack (Next.js 15.0.3 / React 19.0.0-rc / Node.js). It has been deliberately configured to be vulnerable to one of the most critical vulnerabilities in the React ecosystem: **React2Shell (CVE-2025-55182)**.

This lab is designed to train students and Red Teams in:
- Web application penetration testing methodology
- Exploiting Server Actions in Next.js
- Exploiting Prototype Pollution leading to Command Injection (RCE)
- Chaining multiple vulnerabilities (IDOR → Mass Assignment → Framework-level RCE)

## 🔴 The Kill Chain

The lab requires chaining **two distinct vulnerability classes** to achieve RCE:

```
┌─────────────┐     ┌──────────────────┐     ┌──────────────────────────┐     ┌─────────────┐
│  Register   │────▶│  Mass Assignment │────▶│  React2Shell RCE         │────▶│  Reverse    │
│  as STUDENT │     │  STUDENT→LECTURER│     │  CVE-2025-55182          │     │  Shell      │
└─────────────┘     └──────────────────┘     └──────────────────────────┘     └─────────────┘
     Stage 1              Stage 2                    Stage 3                     Stage 4
```

### Stage 1 — Initial Access
Register a `STUDENT` account via `/register`. The backend enforces the `STUDENT` role server-side.

### Stage 2 — Privilege Escalation (IDOR + Mass Assignment)
The `updateUserProfile` Server Action in `lib/actions/user.ts` trusts the client-supplied `userId` (IDOR) and uses an unsafe `deepMerge()` function that doesn't filter keys (Mass Assignment). An attacker can inject `"role": "LECTURER"` to escalate privileges. `ADMIN` escalation is explicitly blocked.

### Stage 3 — Prototype Pollution to RCE
With a LECTURER session, the attacker can reach the `/lecturer/assignments` route. The `createAssignment` Server Action receives assignment metadata from the client and merges it using the vulnerable `deepMerge()` function. By intercepting the Server Action request and injecting a `__proto__` payload into the JSON arguments, the attacker pollutes the global `Object.prototype`. The application later falls back to a polluted `logCommand` property when executing a shell command via `child_process.exec()`, resulting in Remote Code Execution.

### Stage 4 — Post-Exploitation
Harvest credentials from `.env`, pivot to the internal database (via docker networking), and establish persistence.

## Tech Stack

| Layer | Technology | Version |
|-------|------------|---------|
| Framework | Next.js (App Router) | **15.0.3 (Vulnerable)** |
| UI Library | React | **19.0.0-rc (Vulnerable)** |
| Language | TypeScript (strict) | 6.x |
| Styling | Tailwind CSS | 4.x |
| Database | PostgreSQL via Prisma | 7.8.0 |
| Auth | NextAuth (Credentials) | v5 beta |

## Architecture

```text
app/
  (auth)/
    login/           → Login page
    register/        → Registration page (STUDENT only)
  student/
    settings/        → 🔴 IDOR + Mass Assignment surface (updateUserProfile)
    dashboard/       → Student portal
  lecturer/
    assignments/     → 🔴 React2Shell target (createAssignment Server Action)
  admin/
    dashboard/       → Admin dashboard (requires ADMIN role)

lib/
  actions/
    user.ts          → 🔴 IDOR + Mass Assignment (updateUserProfile + deepMerge)
    assignment.ts    → Server Action with LECTURER auth gate (React2Shell entry point)
    register.ts      → Secure registration (enforced STUDENT role)
  utils/
    unsafeMerge.ts   → 🔴 Prototype Pollution (no __proto__ sanitization)
```

## Default Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@elearning.com` | `password123` |
| Lecturer | `lecturer@elearning.com` | `password123` |
| Student | `student@elearning.com` | `password123` |

## Quick Start

### Prerequisites
- Node.js 20+
- Docker (for PostgreSQL)
- Burp Suite (for exploitation)

### Setup

```bash
# 1. Clone the repository
git clone <repo-url> && cd e-learning-ui

# 2. Install dependencies (You might see warnings due to the vulnerable React version - this is expected)
npm install --legacy-peer-deps

# 3. Start PostgreSQL (via docker-compose)
docker compose up -d

# 4. Configure environment
cp .env.example .env

# 5. Push schema & seed database
npx prisma db push
npx prisma db seed

# 6. Start dev server
npm run dev
```

Open: `http://localhost:3000`

## ⚠️ Disclaimer

This application is provided for **educational and authorized security testing purposes only**. Unauthorized access to computer systems is illegal. The authors are not responsible for any misuse of this software. Always obtain proper written authorization before conducting penetration tests.

## License

MIT — For educational use only.
