# Nexus · Centralized Festival & Club Operations Management Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React 19](https://img.shields.io/badge/React-19.0-61dafb.svg?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-7.0-3178c6.svg?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8.3-646cff.svg?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind%20CSS-4.3-38bdf8.svg?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Firebase](https://img.shields.io/badge/Firebase-Firestore%20%7C%20Auth-ffca28.svg?logo=firebase&logoColor=black)](https://firebase.google.com/)

---

## 1. Project Name

**Nexus — Centralized Student Club & Festival Operations Suite**  
*Organized & Managed by DRMC IT Club (Dhaka Residential Model College Information Technology Club)*

---

## 2. Project Description

**Nexus** is an enterprise-grade, centralized festival and event management ecosystem built for student organizations, collegiate IT clubs, and academic institutions. High-profile campus festivals—such as national technology carnivals, science exhibitions, hackathons, and programming olympiads—often struggle with fragmented Google Forms, untracked cash/ticket registrations, chaotic on-ground queues, and delayed cross-device updates.

Nexus resolves this operational friction by uniting the entire festival lifecycle under one roof:
- **Public Discovery & Exploration**: Attendees can browse active, upcoming, and past festivals, inspect schedules, review competition rules, prize pools, and team requirements.
- **Dynamic Registration Engine**: Seamless registration workflows for both solo competitions and multi-member team contests, complete with duplicate entry prevention and instant ticket generation.
- **Digital QR Ticket Passes**: Participants receive a unique digital pass featuring a scannable QR verification code, downloadable summary, and live status tracking.
- **High-Velocity On-Ground Check-in**: Desk volunteers and coordinators can verify attendees in seconds using camera scanning, manual ticket codes, or student IDs.
- **Organizer Operations Command Center**: Live real-time dashboard powered by Google Firebase Firestore providing instant multi-device synchronization, event scheduling, capacity tracking, participant rosters, CSV exporting, and analytical data visualizations.

---

## 3. Features

### 🌟 Public & Participant Experience
- **Festival Catalog & Detail Portals**:
  - Multi-festival support with detailed banners, countdowns, themes, and venue guides.
  - Granular event breakdown by category (Competitive Programming, Robotics, Web & App Development, Gaming/Esports, Technical Quizzes, Design).
  - Comprehensive contest briefs covering rules, team constraints (minimum & maximum team members), registration fees, deadlines, and prize structures.
- **Streamlined Registration Flow**:
  - Solo & Team registration modes with dynamic member field expansion and validation.
  - Institutional details capture (Institution name, Student ID, Department, Contact info).
  - Automatic seat capacity enforcement with live remaining-seat calculations.
- **Nexus Digital Ticket Pass**:
  - Dynamic SVG/Canvas QR code generation for every confirmed registration.
  - Instant digital pass view with copyable reference code (e.g., `REG-2026-XXXX`).
  - Print & Save capability for attendees to show on smartphones or physical badge printouts.
- **Participant Self-Service Portal (`/my-registrations`)**:
  - Live dashboard for students to view all enrolled events across all festivals.
  - Real-time status indicators (`Confirmed`, `Pending Approval`, `Waitlisted`, `Checked-In`).
- **Global Command Palette (`Cmd + K` / `Ctrl + K`)**:
  - Quick-jump search to navigate to any festival, event category, or administrative console.

### 🛡️ Organizer & Operations Workspace (`/admin`)
- **Cross-Device Cloud Synchronization**:
  - Real-time bi-directional synchronization via **Firebase Firestore** (`onSnapshot`).
  - Festivals or events created, edited, or archived on one coordinator's laptop immediately appear on participant smartphones and volunteer check-in terminals without page reloads.
- **Festival Management (`/admin/fests`)**:
  - Create, edit, and toggle status (`Active`, `Upcoming`, `Completed`, `Draft`) for festivals.
  - Customize banner imagery, dates, venue locations, and organizational attribution.
- **Event Management (`/admin/events`)**:
  - Configure multi-day events, fees, maximum team sizes, registration limits, and prizes.
- **Participant Roster & CRM (`/admin/participants`)**:
  - Complete attendee database with search across name, institution, student ID, and registration code.
  - Status management (Confirm, Waitlist, Reject) and one-click CSV export for external reporting.
- **On-Ground Check-In Desk (`/admin/checkin`)**:
  - Ultra-fast attendee check-in terminal designed for registration desks.
  - Scannable QR code verification, ticket code lookup, or student ID search.
  - Live check-in audit timestamps and duplicate check-in prevention.
- **Operational Analytics Dashboard (`/admin/analytics`)**:
  - Interactive charts powered by Recharts (Category breakdown, team vs. individual distribution, attendance conversion rate, and revenue totals).
- **Workspace Settings & Security (`/admin/settings`)**:
  - Manage organizer credentials, official contact email, and password toggles with eye reveal/hide.
  - Live Firebase Cloud Database health indicator and one-click seed restore.

---

## 4. Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend Framework** | **React 19** (TypeScript, Functional Components, Custom Hooks) |
| **Bundler & Build Tool**| **Vite 8.3** with Fast Refresh and optimized production rollup |
| **Styling & Design** | **Tailwind CSS v4** (`@tailwindcss/vite`), Custom CSS Grid, Glassmorphism |
| **Icons & Visuals** | **Lucide React** (`lucide-react` v0.546) |
| **Animation & UX** | **Motion** (`motion` v12.23) for fluid micro-interactions |
| **Data Visualization** | **Recharts** (`recharts` v2.15) for responsive operational charts |
| **Cloud Database** | **Firebase Firestore** (Real-time NoSQL document store with live listeners) |
| **Cloud Auth** | **Firebase Authentication** (Google OAuth & Credential Sessions) |
| **AI Capabilities** | **Google GenAI SDK** (`@google/genai` v2.4.0) |
| **Deployment Runtime**| **Google Cloud Run** containerized hosting |

---

## 5. Setup Instructions

### Prerequisites
- **Node.js**: `v20.x` or higher (LTS recommended)
- **npm**: `v10.x` or higher (or `pnpm` / `yarn`)
- Modern web browser (Chrome, Edge, Firefox, Safari)

### Step-by-Step Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/drmc-it-club/nexus-festival-platform.git
   cd nexus-festival-platform
   ```

2. **Install project dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env` file in the project root (reference `.env.example` if present):
   ```env
   # Firebase Cloud Configuration
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=ai-studio-nexus-d6ab1ba6-a5fe-40c4-a620-e2248725c74f
   VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   VITE_FIREBASE_APP_ID=your_firebase_app_id
   ```

4. **Start the local development server**:
   ```bash
   npm run dev
   ```
   Open your browser and navigate to `http://localhost:3000`.

5. **Lint and Type-Check**:
   ```bash
   npm run lint
   ```

6. **Build for Production**:
   ```bash
   npm run build
   ```

7. **Preview Production Build**:
   ```bash
   npm run preview
   ```

---

## 6. Deployment URL

The application is deployed and available live at:

- **Production / Shared App URL**:  
  👉 [https://ais-pre-lnbpqduuy57kdwjlcgi3us-88702230071.asia-southeast1.run.app](https://ais-pre-lnbpqduuy57kdwjlcgi3us-88702230071.asia-southeast1.run.app)

- **Development Preview URL**:  
  👉 [https://ais-dev-lnbpqduuy57kdwjlcgi3us-88702230071.asia-southeast1.run.app](https://ais-dev-lnbpqduuy57kdwjlcgi3us-88702230071.asia-southeast1.run.app)

---

## 7. Demo Credentials

The platform includes pre-seeded accounts configured for immediate evaluation across different access levels:

| Role | Email / Identifier | Password | Access Privileges |
| :--- | :--- | :--- | :--- |
| **Lead Organizer (Admin)** | `organizer@drmcitclub.org` | `NexusAdmin2026!` | Full Operations Workspace (`/admin`): Fest & Event Editor, Check-In, Analytics, Settings |
| **Participant (Student)** | `tahmid.hasan@drmc.edu.bd` | `NexusStudent2026!` | Public Portal, Event Registration, Digital Pass View (`/my-registrations`) |

> **Quick Access Tip**: The Authentication page (`/auth`) provides quick one-click demo login buttons to test both the Organizer and Participant roles instantly without manual typing.

---

## 8. Third-Party Services / APIs

1. **Google Firebase Firestore**:
   - Cloud NoSQL document database used for real-time bi-directional synchronization of collections: `festivals`, `events`, `registrations`, `checkIns`, and `organization`.
2. **Google Firebase Authentication**:
   - Handles secure user authentication, token sessions, and Google OAuth sign-in.
3. **Google Cloud Run**:
   - Containerized serverless runtime providing high availability, auto-scaling, and SSL termination.
4. **Google GenAI API (`@google/genai`)**:
   - Server-side capabilities enabled for intelligent operations and automated festival brief composition.

---

## 9. AI Tools & Features Used

In full disclosure and compliance with transparency guidelines, the following AI tools and technologies were utilized during the conception, development, and refinement of this project:

- **Google AI Studio Build & Gemini 3.8 Flash**:
  - Used as the primary architectural coding and engineering engine for scaffolding the full-stack React TypeScript codebase, designing database schemas, configuring Firestore security rules, building UI components, and debugging real-time cross-device data flow.
- **Claude 3.5 Sonnet (Anthropic)**:
  - Utilized for domain-specific prompt engineering, architectural validation, and complex state management logic structuring.
- **ChatGPT (OpenAI GPT-4o)**:
  - Utilized for competitive benchmarking against collegiate festival platforms, schema planning, and documentation outlining.
- **Cursor / GitHub Copilot**:
  - Leveraged for contextual inline TypeScript autocompletion and rapid component refactoring.

---

## 10. Screenshots & Interface Layouts

### 1. Public Festival Hero & Discovery Portal (`/`)
```
+---------------------------------------------------------------------------------+
|  NEXUS  [DRMC IT CLUB]         Fests   Events   My Passes     [Sign In] [Admin] |
+---------------------------------------------------------------------------------+
|                                                                                 |
|   TECH CARNIVAL 2026 · 14TH NATIONAL TECHNOLOGY SYMPOSIUM                       |
|   =======================================================                       |
|   [ 1,200+ Participants ]  [ 14 Events ]  [ 3 Days ]  [ Oct 24-26, 2026 ]        |
|                                                                                 |
|   [ Explore All Events ]        [ Register Now ]        [ View Schedule ]       |
|                                                                                 |
|   +-----------------------+ +-----------------------+ +-----------------------+ |
|   | Competitive Code Fest | | Robo-Soccer Arena 2026| | Hackathon: CyberX     | |
|   | 3-Person Team · $0    | | 4-Person Team · $10   | | 2-4 Members · $15     | |
|   +-----------------------+ +-----------------------+ +-----------------------+ |
+---------------------------------------------------------------------------------+
```

### 2. Digital Ticket Pass & QR Verification (`/registration/:id`)
```
+---------------------------------------------------------------------------------+
|                           NEXUS VERIFIED TICKET PASS                            |
|  +---------------------------------------------------------------------------+  |
|  | EVENT: Competitive Programming Olympiad          FEST: Tech Carnival 2026 |  |
|  | PARTICIPANT: Tahmid Hasan                        STATUS: [ CONFIRMED ]    |  |
|  | PASS CODE: REG-2026-TC-0842                      SEAT: Hall-A / Table 14  |  |
|  |                                                                           |  |
|  |      [  QR CODE SCANNER  ]       DATE: Oct 24, 2026 · 10:00 AM           |  |
|  |      [ ■■■■■■■■ ■■■ ■■■■ ]       VENUE: DRMC Innovation Complex          |  |
|  |      [ ■■  ■  ■ ■■■ ■  ■ ]                                               |  |
|  |                                                                           |  |
|  |  [ Download PDF / Image ]         [ Print Physical Pass ]                 |  |
|  +---------------------------------------------------------------------------+  |
+---------------------------------------------------------------------------------+
```

### 3. Organizer Operations Desk & Real-time Check-In (`/admin/checkin`)
```
+---------------------------------------------------------------------------------+
|  OPERATIONS WORKSPACE  |  Overview  Fests  Events  Participants  [CHECK-IN]     |
+---------------------------------------------------------------------------------+
|  [ Instant Search by Ticket Code, Student ID, or Name...                      ] |
|                                                                                 |
|  LIVE METRICS:  Total: 482   |   Checked In: 391 (81.1%)   |   Pending: 91      |
|                                                                                 |
|  +---------------------------------------------------------------------------+  |
|  | REG-2026-TC-0842 · Tahmid Hasan · Class XII · DRMC        [ CHECK IN NOW ]|  |
|  | REG-2026-TC-0843 · Sarah Rahman · Dept of CS · NDC        [ CHECKED IN ✓ ]|  |
|  | REG-2026-TC-0844 · Abrar Zahin  · Grade 11 · St. Joseph   [ CHECK IN NOW ]|  |
|  +---------------------------------------------------------------------------+  |
+---------------------------------------------------------------------------------+
```

---

## 11. Known Limitations

1. **Hardware Camera Access**:
   - The QR code camera scanner utilizes the browser's `navigator.mediaDevices.getUserMedia` API, which requires HTTPS and explicit user permissions. On environments without an attached webcam, the check-in desk automatically falls back to instant ticket/student ID search.
2. **Offline Writing Queue**:
   - While the app maintains offline caching via `localStorage`, new writes (such as creating new festivals or updating event descriptions) require an active internet connection to synchronize with the Firebase Firestore cloud database.
3. **Transactional Outbound Emails**:
   - The platform delivers immediate, scannable digital passes in-browser with one-click print/download capability. Direct SMTP/SendGrid email delivery can be plugged in by connecting a webhook to the registration completion event.

---

## 12. License

This project is licensed under the **MIT License**.  
See the [LICENSE](LICENSE) file for the full license text.

---

## 13. Regulatory & Organizing Authority Clause

> **The organizing authority reserves the right to make the final decision regarding rule interpretation, eligibility, judging, scoring, and any matters not explicitly covered in these guidelines. All decisions made by the judging panel and organizing authority shall be final.**

---

*Engineered with precision for Dhaka Residential Model College IT Club by the Nexus Development Team.*
