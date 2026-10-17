# Reva Phoenix Calibration Laboratories & Metrology Platform

> **Precision Measured. Quality Assured.**  
> ISO/IEC 17025 Accredited Calibration, Metrological Testing, API Standards & Turnkey Laboratory Engineering.

---

## 🌟 Overview

**Reva Phoenix Calibration Laboratories** is an enterprise-grade web application and metrological showcase platform. It delivers a state-of-the-art interactive experience highlighting 35+ integrated calibration laboratories, verified Google reviews, metrology portfolios, interactive equipment CMC databases, and client quote generation.

---

## 🚀 Key Highlights & Architecture

- **Interactive 35 Integrated Calibration Laboratories:**
  - Searchable, categorized metrology suites (Dimensional, Thermal, Pressure & Vacuum, Fluid Flow, Force, Torque, Mass & Volume, Electrotechnical, Optical, and more).
  - Modal technical drawers with expandable CMC parameters, standard master calibrators, and NABL accreditation details.
- **Corporate Gallery & Portfolios:**
  - Dedicated [gallery.html](gallery.html) featuring turnkey projects, API Spec Q1/11B/11AX implementations, and high-resolution laboratory infrastructure photography.
  - Interactive Lightbox with caption telemetry and full-screen view.
- **Verified Client Reviews:**
  - Authentic Google Business reviews from tier-1 engineering clients (Emerson Process Management, Sara Sae, Severn Glocon, LUK India, etc.).
- **Smooth Kinetic Experience:**
  - Inertial smooth scrolling powered by **Lenis**.
  - Hardware-accelerated typography and scroll triggers powered by **GSAP** & **ScrollTrigger**.
- **Admin Control & Cloud Sync:**
  - Admin management interface (`/admin`) for laboratory scopes, equipment databases, and enquiries.
  - Optional cloud synchronization with Supabase & Firebase.

---

## 📂 Project Structure

```
.
├── index.html                   # Main landing page & 35 laboratory suites
├── gallery.html                 # Corporate gallery & project portfolios
├── admin.html                   # Admin control center
├── admin/                       # Admin interface modules
│   └── index.html
├── assets/                      # Production media & corporate graphics
│   ├── images/
│   │   ├── clients/             # Verified client logos & SVG/PNG badges
│   │   ├── gallery/             # High-res infrastructure & project photos
│   │   └── labs/                # Laboratory suites visual assets
│   └── uploads/                 # Dynamic uploaded resources
├── css/                         # Modular CSS design system
│   ├── design-system.css        # Color tokens, typography, dark mode foundation
│   ├── components.css           # Buttons, cards, modals, form inputs
│   ├── sections.css             # Hero, ticker, testimonials, CTA layouts
│   ├── responsive.css           # Mobile & tablet viewports
│   └── gallery.css              # Gallery grids, filter pills, album layouts
├── js/                          # Application engine & dynamic hydration
│   ├── app.js                   # Primary state controller & navigation
│   ├── smooth-scroll.js         # Lenis smooth scrolling with GSAP integration
│   ├── lenis.min.js             # High-performance smooth scroll library
│   ├── gsap-typography.js       # Cinematic word splits & scroll triggers
│   ├── gsap.min.js              # GSAP core engine
│   ├── ScrollTrigger.min.js     # GSAP ScrollTrigger plugin
│   ├── laboratories-data.js     # Complete 35+ laboratory datasets
│   ├── lightbox.js              # Interactive fullscreen media lightbox
│   ├── enquiry-modal.js         # Quotation & booking modal controller
│   ├── stats-counter.js         # Animated telemetry counters
│   ├── cloud-config.js          # Cloud configuration bridge
│   └── supabase-db.js           # Supabase REST client
├── supabase/                    # SQL migration scripts & schemas
│   └── schema.sql
├── server.py                    # Local Python dev server with REST endpoints
├── .env.example                 # Cloud credentials template
└── .gitignore                   # Safe Git ignore patterns (protects secrets)
```

---

## 💻 Local Quickstart

### Option 1: Python Dev Server (Recommended)
```bash
python3 server.py
```
Open [http://localhost:8080](http://localhost:8080) in your browser.

### Option 2: Any Static Web Server
```bash
# Using Node / npx serve
npx serve .

# Or using Python's built-in module
python3 -m http.server 8080
```

---

## 🔒 Security & Environment Variables

- Copy `.env.example` to `.env` if using Supabase or Firebase features:
  ```bash
  cp .env.example .env
  ```
- **Note:** Real `.env` files and private credentials are excluded via `.gitignore` and must never be committed to public repositories.

---

## 📄 License & Intellectual Property

Copyright © Reva Phoenix Labs & Consultants Private Limited. All rights reserved.
