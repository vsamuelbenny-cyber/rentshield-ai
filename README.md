# RentShield AI — Rental Scam & Fake Listing Detector

![RentShield AI Banner](https://img.shields.io/badge/Status-Hackathon--Ready-00F5D4?style=for-the-badge)
![FastAPI](https://img.shields.io/badge/Backend-FastAPI%20%7C%20Python%203.11-009688?style=for-the-badge&logo=fastapi)
![React](https://img.shields.io/badge/Frontend-React%20%7C%20TypeScript%20%7C%20Vite-61DAFB?style=for-the-badge&logo=react)
![TailwindCSS](https://img.shields.io/badge/Design-Tailwind%20CSS-38BDF8?style=for-the-badge&logo=tailwindcss)
![SQLite](https://img.shields.io/badge/Database-SQLite-003B57?style=for-the-badge&logo=sqlite)

> **RentShield AI** is an explainable cybersecurity platform engineered to protect prospective tenants and investigators from rental fraud, phantom apartment listings, and advance-fee wire traps before funds move.

---

## Key Features

1. **Multi-Vector Heuristic Text Engine**:
   - Detects untraceable wire demands (Western Union, MoneyGram).
   - Identifies deposit-before-viewing lockbox phishing traps (Zelle, CashApp, gift cards).
   - Flags classic scam tropes (overseas church missionary relocation, military deployment, mailed keys via courier).
   - Flags artificial urgency coercion and off-platform redirect communication.

2. **Regional Rental Price Anomaly Engine**:
   - Benchmarks listing rent against municipal datasets (median, min/max bounds, standard deviation, z-score).
   - Detects suspiciously cheap pricing lures (e.g., luxury 3BR penthouses listed 60%+ below market median).
   - Analyzes deposit-to-rent ratios to identify inflated deposit extortion.

3. **Client-Safe Perceptual Photo Duplicate Detection**:
   - Generates 64-bit perceptual image hashes (`pHash`) locally using `Pillow` and `ImageHash`.
   - Compares Hamming distances against previously registered properties to catch stolen MLS/Airbnb photos reused across different cities.
   - **Zero External Uploads**: Image processing is 100% server-local; images are never leaked to third parties.

4. **Transparent, Explainable Risk Report**:
   - Color-coded composite risk score (0–100) and risk tier (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`).
   - Dimension-by-dimension score breakdown (Text, Price, Image, Contact).
   - Exact highlighted text snippets showing why specific rules triggered.
   - Actionable verification checklist tailored to the specific risk vectors discovered.

5. **Curated 1-Click Demo Scenarios**:
   - Pre-loaded interactive presets in the UI:
     - **Scenario 1**: Missionary Wire Transfer Urgency Scam
     - **Scenario 2**: Too-Good-To-Be-True Luxury Penthouse Price Lure
     - **Scenario 3**: Deposit-Before-Viewing Zelle Trap
     - **Scenario 4**: Legitimate Verified-Looking 2BR Apartment

6. **Scam Analytics & History Registry**:
   - Visual dashboard powered by Recharts (risk distribution donut, frequent scam indicator bars).
   - Searchable, filterable audit table of all evaluated listings with instant report re-inspection.

---

## Architecture

```
rentshield-ai/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── routes_analysis.py    # Scanner endpoints (/api/scan, /api/samples)
│   │   │   ├── routes_dashboard.py   # Analytics & KPI endpoints
│   │   │   └── routes_listings.py    # Listing query & audit history
│   │   ├── data/
│   │   │   ├── benchmark_rents.json  # Regional rental baseline distributions
│   │   │   └── sample_listings.json  # Curated test scenarios
│   │   ├── services/
│   │   │   ├── text_analyzer.py      # Scam tropes & payment regex analyzer
│   │   │   ├── price_analyzer.py     # Regional median & z-score anomaly detector
│   │   │   ├── image_analyzer.py     # Perceptual hash & Hamming distance matching
│   │   │   ├── risk_scorer.py        # Composite explainable scoring engine
│   │   │   └── seeder.py             # Automatic startup demo data population
│   │   ├── config.py                 # Pydantic v2 application settings
│   │   ├── database.py               # SQLite connection & table creation
│   │   ├── models.py                 # SQLAlchemy models
│   │   ├── schemas.py                # Pydantic validation schemas
│   │   └── main.py                   # FastAPI application entrypoint
│   ├── tests/                        # Full Pytest test suite (17 tests)
│   ├── requirements.txt
│   └── pytest.ini
├── frontend/
│   ├── src/
│   │   ├── components/               # Navbar, ScannerForm, RiskReportModal, Charts, Table
│   │   ├── pages/                    # ScannerPage, DashboardPage, AboutSafetyPage
│   │   ├── services/                 # Axios API integration
│   │   ├── types/                    # TypeScript interfaces
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.ts
├── .env.example
├── .gitignore
├── README.md
├── run-backend.bat
├── run-frontend.bat
└── start-dev.ps1
```

---

## Windows Quickstart Guide (PowerShell)

### Prerequisites
- Python 3.10+ (Tested on Python 3.11)
- Node.js 18+ (Tested on Node.js 24)

---

### Step 1: Backend Setup

Open Windows PowerShell in the project directory:

```powershell
cd backend

# Create virtual environment (if not already created)
python -m venv .venv

# Activate virtual environment
.\.venv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt

# Run backend automated tests (17 passed)
python -m pytest tests -v

# Start the FastAPI server
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

- Backend API: `http://127.0.0.1:8000`
- Interactive Swagger API Docs: `http://127.0.0.1:8000/docs`

---

### Step 2: Frontend Setup

Open a second Windows PowerShell window:

```powershell
cd frontend

# Install dependencies (use npm.cmd on Windows)
npm.cmd install

# Build verification
npm.cmd run build

# Start the Vite development server
npm.cmd run dev
```

- Web Interface: `http://localhost:5173`

---

### Step 3: Or Use 1-Click Launchers

- Double-click `run-backend.bat` to launch the API.
- Double-click `run-frontend.bat` to launch the web client.
- Or in PowerShell: `.\start-dev.ps1`

---

## Environment Variables

Copy `.env.example` to `.env` in the project root if you wish to customize port bindings or defaults:

```bash
cp .env.example .env
```

| Variable | Default Value | Description |
| :--- | :--- | :--- |
| `ENVIRONMENT` | `development` | Runtime mode (`development` / `production`) |
| `BACKEND_HOST` | `127.0.0.1` | FastAPI server host binding |
| `BACKEND_PORT` | `8000` | FastAPI server port |
| `ALLOWED_ORIGINS` | `http://localhost:5173,...` | Allowed CORS origins for the frontend |
| `DATABASE_URL` | `sqlite:///./rentshield.sqlite3` | SQLite database URI |
| `UPLOAD_DIR` | `./uploads` | Directory for temporary photo validation & hashes |
| `MAX_IMAGE_SIZE_MB` | `5` | Maximum upload size in megabytes |
| `HASH_SIMILARITY_THRESHOLD` | `8` | Hamming distance threshold for duplicate photos (<= 8 indicates near-duplicate) |
| `EXTERNAL_AI_API_KEY` | *(empty)* | Optional API key for external LLM; **RentShield AI functions 100% locally without any external keys** |

> **Note on Windows PowerShell**: If PowerShell blocks script execution (`PSSecurityException`), run `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass` in your session, or run commands using `npm.cmd` and batch files (`run-backend.bat`, `run-frontend.bat`).


---

## Ethical & Transparency Disclaimer

> [!IMPORTANT]
> **Heuristic Assessment Notice**: RentShield AI provides automated heuristic risk scoring and probability metrics. Its conclusions do **not** constitute legal determinations of fraud.
>
> 1. **No Definitively Fraudulent Accusations**: Listings are labeled with objective probability tiers (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`) and specific trigger indicators, not definitive verdicts.
> 2. **Demo Data Distinction**: Pre-loaded scenario properties are explicitly marked with a **"Demo Scenario"** badge to distinguish them from user-submitted listings.
> 3. **Privacy**: Listing photos are hashed locally using perceptual algorithms (`pHash`). No user images are transmitted to external AI cloud services without express consent.
> 4. **Verification Protocol**: Users are always advised to conduct an in-person walkthrough and verify property deed records on the local County Tax Assessor portal.
