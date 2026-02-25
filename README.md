# AttendTrack — Multi-Sector Attendance Tracker

A full-stack attendance dashboard with **4 distinct occupation themes**, built with **React + Vite** (frontend) and **FastAPI** (backend).

---

## 🎯 Occupation Themes

| # | Sector | Accent | Member Label | ID Label | Group Label |
|---|--------|--------|-------------|---------|------------|
| 🏥 | **Medical** | Sky Blue / Cyan | Staff Member | Staff ID | Ward / Department |
| 💼 | **Corporate** | Amber / Gold | Employee | Employee ID | Team / Division |
| 🏛️ | **Government** | Green / Saffron | Officer | Employee No. | Department / Ministry |
| 🎓 | **Education** | Violet / Indigo | Student | Roll Number | Class / Course |

> Select your sector on first launch — the entire UI (colors, labels, sidebar) adapts to it. Switch anytime from the sidebar.

---

## 📅 Attendance with Dates

Attendance is **date-based**. Each record is tied to a specific date:

- **Mark Attendance** — pick any date from the date picker, toggle Present / Absent for each member, then save
- **Re-submit** — submitting attendance for an existing date **overwrites** previous records for that date
- **View by Date** — `GET /api/attendance/?date=YYYY-MM-DD` returns records for that day
- **Dashboard** — shows today's stats and a **7-day weekly bar chart** (present vs absent per day)
- **History** — full log of all records via `GET /api/attendance/history`

---

## 🗂️ Project Structure

```
AttendanceTracker/
├── backend/
│   ├── main.py               # FastAPI app + CORS
│   ├── database.py           # SQLAlchemy + SQLite
│   ├── models.py             # Student & Attendance models
│   ├── schemas.py            # Pydantic schemas
│   ├── requirements.txt      # Python dependencies
│   └── routers/
│       ├── students.py       # /api/students  (GET, POST, DELETE)
│       ├── attendance.py     # /api/attendance (GET by date, POST bulk, history)
│       └── dashboard.py      # /api/dashboard/stats + /weekly
├── frontend/
│   ├── src/
│   │   ├── api.js            # Axios API client
│   │   ├── App.jsx           # ThemeProvider + Router
│   │   ├── index.css         # 4 theme color sets (body[data-theme])
│   │   ├── context/
│   │   │   └── ThemeContext.jsx  # Occupation config + localStorage
│   │   ├── components/
│   │   │   └── Navbar.jsx        # Sidebar + inline occupation switcher
│   │   └── pages/
│   │       ├── OccupationSelector.jsx  # Landing page (pick sector)
│   │       ├── Dashboard.jsx           # Stats + 7-day chart
│   │       ├── Students.jsx            # Members table + add/delete
│   │       └── Attendance.jsx          # Date picker + toggle rows + save
│   ├── vercel.json           # SPA routing rewrites
│   └── .env                  # VITE_API_URL for local dev
└── render.yaml               # Render deployment blueprint
```

---

## 🚀 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/students/` | List all members |
| `POST` | `/api/students/` | Add a member |
| `DELETE` | `/api/students/{id}` | Remove a member |
| `POST` | `/api/attendance/` | Bulk mark attendance for a `date` |
| `GET` | `/api/attendance/?date=YYYY-MM-DD` | Get attendance for a specific date |
| `GET` | `/api/attendance/history` | Get last 100 attendance records |
| `GET` | `/api/dashboard/stats` | Today's stats (present / absent / %) |
| `GET` | `/api/dashboard/weekly` | Last 7 days data for bar chart |

> Interactive docs available at `http://localhost:8000/docs` when running locally.

---

## 💻 Local Development

### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
# → http://localhost:8000
# → Swagger UI: http://localhost:8000/docs
```

### Frontend
```bash
cd frontend
npm install
npm run dev
# → http://localhost:5173
```
---

## 🚀 Live Demo
| Layer    | URL |
|----------|-----|
| Frontend | https://attendancerackert.vercel.app/ |
| Backend  | https://attendance-backend-r2c6.onrender.com |
| API Docs | https://attendance-backend-r2c6.onrender.com/docs |

---

## ☁️ Deployment

### Backend → Render
1. Push repo to **GitHub**
2. Go to [render.com](https://render.com) → **New → Blueprint**
3. Connect repo — Render auto-reads `render.yaml`
4. Deploy and copy the service URL

### Frontend → Vercel
1. Go to [vercel.com](https://vercel.com) → **New Project**
2. Import repo, set **Root Directory** = `frontend/`
3. Add environment variable: `VITE_API_URL` = your Render backend URL
4. Deploy!

> ⚠️ **Render free tier** spins down after inactivity — first request may take ~30s. Use an uptime pinger or upgrade to keep it warm.
