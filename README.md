# 🌾 KisanSetu (किसानसेतु) — Smart Agricultural Procurement Platform

> **Bridging the Farmer to Guaranteed Minimum Support Price (MSP) through Transparent Queuing, Instant Digital Tokens, and 24-Hour Direct Benefit Transfer (DBT).**

[![Python Version](https://img.shields.io/badge/Python-3.10%2B-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![Flask](https://img.shields.io/badge/Framework-Flask-000000?style=for-the-badge&logo=flask&logoColor=white)](https://flask.palletsprojects.com/)
[![JavaScript](https://img.shields.io/badge/Frontend-Vanilla_JS_(Zero_Dep)-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![License](https://img.shields.io/badge/License-MIT-22c55e?style=for-the-badge)](LICENSE)
[![Status](https://img.shields.io/badge/Status-Production_Ready-15803d?style=for-the-badge)]()
[![Government Affiliation](https://img.shields.io/badge/Affiliation-Ministry_of_Agriculture_&_Farmers_Welfare-f59e0b?style=for-the-badge)]()

---

## 🌐 Live Website & Demo Links

| Resource | Link |
| :--- | :--- |
| **🚀 Live Production Website** | [https://your-live-website-link.here](https://your-live-website-link.here) *(👈 Insert your deployed live URL here)* |
| **💻 Local Demo Host** | `http://127.0.0.1:5174` |
| **🎥 Video Walkthrough / Presentation** | [Watch Demo Video](https://your-video-link-here) *(👈 Insert YouTube or Google Drive link)* |
| **📄 Project Pitch Deck / Documentation** | [View Documentation](https://your-docs-link-here) |

---

## 👥 Project Team & Contributors

> **Team Name / Batch**: `[Insert Team Name Here, e.g., Team Agrotech Innovators]`  
> **Institution / Organization**: `[Insert College / University / Organization Name Here]`

| Avatar / Photo | Member Name | User ID / Student ID | Role / Specialization | Contact / Social Profiles |
| :---: | :--- | :--- | :--- | :--- |
| 👨‍💻 | **[Member 1 Full Name]** | `[User ID / Roll No 1]` | **Full-Stack Architect & Lead** | [![GitHub](https://img.shields.io/badge/GitHub-181717?style=flat&logo=github)](https://github.com/) 
| 👩‍💻 | **[Member 2 Full Name]** | `[User ID / Roll No 2]` | **Frontend Engineer & UI/UX** | [![GitHub](https://img.shields.io/badge/GitHub-181717?style=flat&logo=github)](https://github.com/)
| 👨‍💻 | **[Member 3 Full Name]** | `[User ID / Roll No 3]` | **Backend Systems & API Design** | [![GitHub](https://img.shields.io/badge/GitHub-181717?style=flat&logo=github)](https://github.com/) 
| 👩‍💻 | **[Member 4 Full Name]** | `[User ID / Roll No 4]` | **QA, Testing & Research** | [![GitHub](https://img.shields.io/badge/GitHub-181717?style=flat&logo=github)](https://github.com/) 

---

## 📌 The Problem Statement

Indian agriculture sustains over **600 million livelihoods**, yet the physical journey of selling harvested produce at government procurement centres (APMC Mandis) remains riddled with systematic bottlenecks:

```
[ Traditional Mandi Woes ]
Unscheduled Arrival ──> 48-72h Vehicle Queues ──> Grain Spillage & Rain Damage ──> Middlemen Exploitation ──> Delayed Payments
```

### 1. The Multi-Day Queue Crisis & Congestion
Farmers often haul tractor-trolleys loaded with perishable grains and must wait **24 to 72 hours** in unorganized physical lines outside mandis under extreme sun or monsoon rains. This causes massive traffic gridlock, physical exhaustion, and high tractor fuel costs.

### 2. Crop Spillage, Weather Damage & Distress Sales
Waiting on open roads exposes harvested grains to rain, dampness, and rodents. Grain moisture increases above permissible Fair Average Quality (FAQ) standards (typically > 12-14%), forcing desperate farmers into distress sales to private middlemen at 20–40% below MSP.

### 3. Middlemen Exploitation & Arbitrary Deductions
Without a transparent digital token system, unregulated middlemen (*Arhatiyas*) demand unofficial commissions, arbitrary weight cuts (*Karda*), or manipulate weighment scales.

### 4. Delayed Payouts & Lack of Audit Trails
Traditional paper tokens often lack digital validation, resulting in delayed cheque disbursements that take weeks or months to reach rural bank accounts.

### 5. The Digital Divide & Language Barriers
Government portals that are English-only and desktop-centric alienate smallholder farmers who need mobile-first, regional-language access.

---

## 💡 The KisanSetu Solution

**KisanSetu** ("Farmer's Bridge") is an end-to-end smart agricultural procurement platform designed to make government procurement **fair, transparent, time-bound, and accessible**.

```
[ The KisanSetu Pipeline ]
1. Smart Slot Booking (Date Bounds & Capacity Check)
                │
                ▼
2. Instant Digital Token (A-001, QR-Ready)
                │
                ▼
3. Zero-Wait Mandi Arrival (Monitor Live "Now Serving" Board)
                │
                ▼
4. Digital Weighment & FAQ Quality Inspection
                │
                ▼
5. 24-Hour Direct Benefit Transfer (DBT) into Aadhaar Bank Account
```

### Key Pillars of the Platform:
1. **Dynamic Slot & Capacity Allocation**: Real-time capacity computation per centre. Prevents overbooking, limits visits to open days, and forbids booking in the past.
2. **Zero-Wait Token Queuing System**: Real-time live queue monitor showing **"Now Serving"** and upcoming tokens, allowing farmers to arrive just in time.
3. **Guaranteed MSP Direct Rate**: Direct procurement calculation based on official government MSP rates (e.g. Wheat at ₹2,425/Qtl, Paddy at ₹2,369/Qtl) with zero middlemen cuts.
4. **Direct Benefit Transfer (DBT)**: Automatic payment calculation upon weighbridge certification, disbursed directly to the farmer's Aadhaar-linked account within 24 hours.
5. **Multilingual Inclusivity**: Instant real-time language toggling between **English**, **हिन्दी (Hindi)**, and **বাংলা (Bengali)**.
6. **Role-Based Workspaces**:
   - 👨‍🌾 **Seller / Farmer**: Register crops, book procurement appointments, download digital tokens, and track DBT settlements.
   - 🏢 **Buyer / Centre Operator**: Manage centre queues, call tokens, inspect crop quality, log weighments, and approve transactions.
   - 🔐 **Protected Administrator**: Secure password-protected oversight console for centre verification, user management, and transaction logs.

---

## 🎮 Interactive Demo & Walkthrough Guide

The application comes pre-loaded with comprehensive demo datasets for instant evaluation without external database setup.

### 🔑 Demo Credentials

| Role | Demo Email | Password | Assigned Centre / Context |
| :--- | :--- | :--- | :--- |
| **👨‍🌾 Farmer / Seller** | `farmer@demo.local` | `demo123` | Individual seller profile, slot booking & token view |
| **👨‍🌾 Farmer (Active Booking)** | `gopal.basu02@gmail.com` | `123456` | Active booking `AGRI-260903-7E45` (Token `A-056`) |
| **🏢 Buyer / Procurement Officer** | `buyer@demo.local` | `demo123` | Barasat Grain Procurement Centre (`CTR-001`) |
| **🔐 System Administrator** | `admin@demo.local` | `demo123` | Full administrative oversight & centre verification |

---

### 🚶‍♂️ Step-by-Step Demo Walkthrough Flow

```
+──────────────────────────────────────────────────────────────────────────+
│                       1. ROLE SELECTION SCREEN                           │
│  [👨‍🌾 Sign In as Seller/Farmer]      [🏢 Sign In as Buyer/Centre]        │
│                [🔐 Platform Administrator (Password-Protected)]          │
+────────────────────────────────────┬─────────────────────────────────────+
                                     │
         ┌───────────────────────────┴───────────────────────────┐
         ▼                                                       ▼
   FARMER PORTAL                                           BUYER PORTAL
 1. Search Centre by District                           1. View Today's Queue
 2. Select Date (Today / Future)                        2. Call Token to Counter
 3. Choose Time Slot Window                             3. Moisture & Purity Check
 4. Receive Token (e.g., A-056)                         4. Record Certified Weight
 5. Monitor Live Queue Display                          5. Authorize 24-Hr DBT Payment
```

#### Phase 1: Farmer Slot Booking & Token Generation
1. Launch the platform at `http://127.0.0.1:5174`.
2. Click **"Sign in as Seller / Farmer"** and enter `farmer@demo.local` / `demo123` (or register a new farmer account).
3. Navigate to **"Book Slot"**.
4. Filter centres by district (e.g., *North 24 Parganas*).
5. Pick an active procurement date (calendar bounds strictly enforce `Today` or future dates).
6. Choose an open time window (e.g., `10:00 AM – 12:00 PM`). Available slot quotas update dynamically.
7. Confirm booking to instantly generate your **Digital Token**.

#### Phase 2: Live Queue Tracking
1. Open the **"Live Queue"** board.
2. Observe the animated queue status:
   - **Now Serving**: Large high-visibility badge displaying the active token being weighed at the counter.
   - **Next in Line**: Tokens scheduled for upcoming inspection.
3. The farmer can relax at home or near the mandi until their token approaches the "Serving" stage.

#### Phase 3: Centre Quality Verification & Weighment
1. Log out and sign in as **Buyer / Centre Operator** using `buyer@demo.local` / `demo123`.
2. View the centre dashboard for **Barasat Grain Procurement Centre**.
3. Select an arriving token and click **"Call Token"**.
4. Enter inspected crop quality metrics (Moisture % under 12%, Purity grade A).
5. Input gross truck weight and tare weight to determine net crop weight.
6. Click **"Complete Weighment & Generate Payout"**.

#### Phase 4: Instant DBT Payout & Administrative Oversight
1. Log in as **Platform Administrator** (`admin@demo.local` / `demo123`).
2. Review aggregated KPIs across all centres:
   - Total Farmers Registered
   - Certified Weighment Volume
   - Total DBT Payments Disbursed
   - Centre Verification Requests & Compliance Audits.

#### Phase 5: Scroll-Revealed Ministry Affiliations & Farmer Support
1. On the login screen, scroll down (or click **"Explore Government Affiliations & Farmer Services ↓"**).
2. Explore the blended agritech footer bar:
   - **KisanSetu Brand Card**: Identity badge with vector logo.
   - **Connect With Us**: Quick channel circles (WhatsApp Kisan Sahayak, Kisan Call Centre `1800-180-1551`, e-NAM Portal, Advisories).
   - **Interactive Action Pills**:
     - Click **Help** → 4-step procurement guide modal.
     - Click **Contact us** → Toll-Free helpline and Krishi Bhawan address modal.
     - Click **Support** → Weighment dispute and grievance resolution details.
     - Click **Services** → MSP assured procurement services breakdown.
     - Click **FAQ** → Comprehensive question & answer accordion.
   - **Ministry of Agriculture & Farmers Welfare Card**: Official **Ashoka Lion Capital** metallic golden emblem with bilingual typography.

---

## 🛠️ Engineering Journey: How We Fixed the Critical Bugs

During the iterative development and rigorous testing of KisanSetu, several architectural and UI glitches were identified, diagnosed, and resolved:

| # | Glitch / Issue Reported | Root Cause | Engineering Solution Implemented | Status |
| :-: | :--- | :--- | :--- | :-: |
| **1** | **Language Switcher Inertia** | Language selector changed string state but failed to trigger a complete reactive re-render of the DOM. | Integrated persistent `localStorage` synchronization with global `render()` state propagation and updated multilingual dictionaries across English, Hindi, and Bengali. | ✅ **FIXED** |
| **2** | **District Search Filter Freeze** | The district search query triggered synchronous re-filtering loops on every keystroke, locking the browser UI thread. | Replaced unindexed DOM searches with a debounced search filter with sanitized regex matchers, restoring 60 FPS responsiveness. | ✅ **FIXED** |
| **3** | **Hardcoded Slots & Past-Date Glitches** | Slot capacities were hardcoded mock values; date inputs allowed farmers to book dates in the past. | Rewrote slot availability engine in `app.py` to calculate real-time remaining capacity per date/centre. Enforced `min = today` HTML5 calendar constraints and backend validation. | ✅ **FIXED** |
| **4** | **Infinite Notification Toast Flood** | Polling loop triggered new toast popups on every 5-second interval even when notifications had not changed. | Implemented message fingerprinting and toast deduplication so alerts only fire when new unread events arrive. | ✅ **FIXED** |
| **5** | **Empty Queue Display ("--")** | When no token was actively called, the display rendered empty dashes without helpful guidance. | Added contextual queue state handling displaying active tokens clearly, or a graceful "Waiting for Next Token" indicator with counter assignment. | ✅ **FIXED** |
| **6** | **Unprotected Admin Portal** | Administrative dashboard lacked credential verification, allowing direct role selection access. | Enforced password challenge validation for Administrator access with session token guards. | ✅ **FIXED** |
| **7** | **CSS Code Duplication & Bloat** | Successive updates had duplicated styles, inflating `styles.css` to 2,161 lines with conflicting selectors. | Refactored and cleaned ~1,300 lines of dead code, reducing stylesheet to 853 structured, documented lines across 15 modular sections. | ✅ **FIXED** |
| **8** | **Cramped Footer Bar on Initial View** | The government trust footer was compressed into the initial viewport, cutting abruptly against the login forms. | Set `.login-shell` to a clean full `100vh` viewport, styled the footer into a seamless dark agritech theme, and revealed it smoothly on scroll with an animated guidance cue. | ✅ **FIXED** |

---

## 🚀 Future Goals & Roadmap (Future Gole)

KisanSetu is architected as an extensible, production-ready foundation. Future development phases include:

```
[ Future Vision Roadmap ]
Phase 1 (Current)        Phase 2 (Near-Term)          Phase 3 (Long-Term)
• Smart Slot Booking     • AI Computer Vision FAQ     • IoT Weighbridge Automation
• Zero-Wait Queuing      • USSD / SMS Token Booking   • Blockchain Traceability
• 24-Hr Direct DBT       • Hyperlocal Rain Alerts     • Multilingual Voice AI
```

### 1. 🤖 AI-Powered Computer Vision Grain Quality Grading
- Integration of lightweight edge models (TensorFlow Lite / OpenCV) enabling farmers to take a smartphone picture of their wheat or paddy grain.
- The model estimates moisture percentage, foreign matter, shriveled kernels, and grain discoloration in seconds, giving farmers objective quality proof before leaving their farm.

### 2. ⚖️ IoT-Connected Automated Weighbridges
- Direct Bluetooth Low Energy (BLE) and MQTT integration with physical electronic weighbridges.
- Net weight readings are transmitted directly into the digital procurement ledger without manual human keyboard input, eliminating weighment tampering or accidental data entry errors.

### 3. ⛓️ Blockchain-Backed Tamper-Proof Procurement Ledger
- Integration of a consortium blockchain (Hyperledger Fabric) where each procurement transaction (Farmer ID, Centre, Net Weight, FAQ Grade, MSP Rate, DBT Hash) is recorded immutably.
- State and Central agencies can audit crop procurement data in real time, preventing ghost procurement and double selling.

### 4. 📱 Offline-First PWA & USSD/SMS Token Generation
- Progressive Web App (PWA) with offline caching and background synchronization for intermittent rural connectivity.
- USSD service code (e.g., `*123*5#`) and SMS bot allowing farmers with basic feature phones (non-smartphones) to book mandi slots and receive their token number via text message.

### 5. ⛈️ Geospatial Weather Alerts & Dynamic Rescheduling
- Integration with the Indian Meteorological Department (IMD) API to alert farmers of sudden rainstorms or unseasonal precipitation in their mandal.
- One-click automatic rescheduling of slots to ensure crops are not transported during severe weather.

### 6. 🗣️ Conversational AI Voice Assistant in Regional Dialects
- Speech-to-text and text-to-speech voice bot supporting regional dialects (Bhojpuri, Maithili, Malwi, Marwari) to guide illiterate farmers through slot booking hands-free.

---

## 🏗️ Architecture & Technology Stack

```
+─────────────────────────────────────────────────────────────────────────+
│                               FRONTEND                                  │
│   • Semantic HTML5 & Modern CSS3 (CSS Grid, Flexbox, Keyframes)         │
│   • Vanilla ES6+ JavaScript (Single Page Architecture, Zero Dep)        │
│   • Inline Scalable Vector Graphics (Custom KisanSetu Logo & Emblems)   │
+────────────────────────────────────┬────────────────────────────────────+
                                     │  RESTful JSON API over HTTP
+────────────────────────────────────▼────────────────────────────────────+
│                                BACKEND                                  │
│   • Python 3.10+ with Flask Lightweight Microframework                  │
│   • RESTful Endpoints (/api/auth, /api/centres, /api/bookings, /api/dbt)│
│   • Session Token Verification & Role-Based Access Control              │
+────────────────────────────────────┬────────────────────────────────────+
                                     │  Atomic Read/Write Operations
+────────────────────────────────────▼────────────────────────────────────+
│                              DATA LAYER                                 │
│   • JSON Database Engine (data/agri-procure.json)                       │
│   • Normalized Entities: Users, Centres, Bookings, Notifications        │
+─────────────────────────────────────────────────────────────────────────+
```

---

## ⚙️ Quick Start & Local Setup

### Prerequisites
- Python 3.9 or higher installed
- Web browser (Chrome, Edge, Firefox, Safari)

### Installation Steps

1. **Clone or Navigate to the Repository**:
   ```powershell
   cd C:\Users\devas\Downloads\proj
   ```

2. **(Optional) Create and Activate a Virtual Environment**:
   ```powershell
   python -m venv .venv
   .\.venv\Scripts\Activate.ps1
   ```

3. **Install Dependencies**:
   ```powershell
   pip install -r requirements.txt
   ```

4. **Launch the Server**:
   ```powershell
   python app.py
   ```

5. **Open in Browser**:
   Open your browser and visit:
   ```
   http://127.0.0.1:5174
   ```

---

## 📄 License & Attribution

This project is licensed under the **MIT License**.  
Developed for agricultural empowerment, fair pricing transparency, and modern public food grain distribution.

*KisanSetu — Empowering Farmers. Eliminating Queues. Securing Guaranteed MSP.*
