# AttendTrack — Multi-Tenant Attendance Management System

A full-stack, multi-tenant attendance dashboard with **company registration**, **role-based access** (admin / employee), **4 occupation themes**, and **department management**. Built with **React + Vite** (frontend) and **FastAPI + SQLite** (backend).

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

## ✨ Features

- **Multi-Tenant Auth** — each company has its own isolated data; admins register their company; employees get admin-generated credentials
- **Role-Based Access** — Admins see Settings, Departments, and Advanced; Employees see only their data
- **Department Management** — Admins can create, rename, and delete departments; members can then be assigned to them
- **Member Management** — add, edit, and delete members (name, ID, department)
- **Mark Attendance** — pick any date, toggle Present / Absent per member, re-submit to overwrite
- **Dashboard** — today's stats, 7-day bar chart, and full attendance records table grouped by date
- **4 Occupation Themes** — Medical, Corporate, Government, Education with custom labels & accent colors
- **Export-ready** — attendance history available via API for Excel/CSV export
- **Search** — filter members by name, ID, or group in real time

---

## 🗂️ Project Structure

```
AttendanceTracker/
├── backend/
│   ├── main.py               # FastAPI app + CORS + router registration
│   ├── database.py           # SQLAlchemy + SQLite
│   ├── models.py             # Company, User, Department, Student, Attendance
│   ├── schemas.py            # Pydantic v2 schemas
│   ├── auth.py               # JWT auth + bcrypt + role guards
│   ├── requirements.txt      # Python dependencies
│   ├── .env.example          # Template — copy to .env and fill in
│   └── routers/
│       ├── auth.py           # /api/auth  (signup, login, me)
│       ├── departments.py    # /api/departments  (CRUD, admin-only write)
│       ├── employees.py      # /api/employees  (CRUD, admin-only)
│       ├── students.py       # /api/students  (CRUD)
│       ├── attendance.py     # /api/attendance (bulk mark, history)
│       ├── dashboard.py      # /api/dashboard/stats + /weekly
│       └── settings.py       # /api/settings  (theme, custom labels)
├── frontend/
│   ├── src/
│   │   ├── api.js            # Axios API client (all endpoints)
│   │   ├── App.jsx           # Router + auth gate + AnimatePresence
│   │   ├── index.css         # 4 theme color systems + global styles
│   │   ├── context/
│   │   │   ├── AuthContext.jsx       # JWT, user state, login/logout
│   │   │   └── ThemeContext.jsx      # Occupation config + localStorage
│   │   ├── components/
│   │   │   └── Navbar.jsx            # Sidebar + admin nav + theme switcher
│   │   └── pages/
│   │       ├── Login.jsx             # Login form (company + email + password)
│   │       ├── Signup.jsx            # Company registration
│   │       ├── Dashboard.jsx         # Stats + chart + attendance records
│   │       ├── Students.jsx          # Members table + add / edit / delete
│   │       ├── Attendance.jsx        # Date picker + toggle rows + save
│   │       ├── Departments.jsx       # Admin: create / rename / delete depts
│   │       ├── Settings.jsx          # Admin: theme + custom labels
│   │       └── Advanced.jsx          # Admin: employee account management
│   ├── .env.production       # VITE_API_URL pointing to Render backend
│   └── vercel.json           # SPA routing rewrites
└── render.yaml               # Render deployment blueprint
```

---

## 🚀 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/signup` | Register company + first admin |
| `POST` | `/api/auth/login` | Login → JWT token |
| `GET` | `/api/auth/me` | Current user info |

### Departments *(admin write)*
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/departments/` | List company departments |
| `POST` | `/api/departments/` | Create department |
| `PUT` | `/api/departments/{id}` | Rename department |
| `DELETE` | `/api/departments/{id}` | Delete department |

### Members
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/students/` | List all members |
| `POST` | `/api/students/` | Add a member |
| `PUT` | `/api/students/{id}` | Edit member |
| `DELETE` | `/api/students/{id}` | Remove member |

### Attendance
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/attendance/` | Bulk mark attendance for a date |
| `GET` | `/api/attendance/?date=YYYY-MM-DD` | Attendance for a specific date |
| `GET` | `/api/attendance/history` | Last 100 attendance records |

### Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/dashboard/stats` | Today's stats |
| `GET` | `/api/dashboard/weekly` | Last 7 days bar-chart data |

> Interactive docs: `http://localhost:8000/docs`

---

## 💻 Local Development

### Backend
```bash
cd backend

# Create .env from the template and set SECRET_KEY
cp .env.example .env
# Edit .env — generate a secret: python -c "import secrets; print(secrets.token_hex(32))"

pip install -r requirements.txt
uvicorn main:app --reload
# → http://localhost:8000
```

### Frontend
```bash
cd frontend
npm install

# For local dev, create frontend/.env.local:
# VITE_API_URL=http://localhost:8000

npm run dev
# → http://localhost:5173
```

---

## 🌐 Live Demo

| Layer | URL |
|-------|-----|
| Frontend | https://attendancerackert.vercel.app/ |
| Backend | https://attendance-backend-r2c6.onrender.com |
| API Docs | https://attendance-backend-r2c6.onrender.com/docs |

---

## ☁️ Deployment

### Backend → Render
1. Push repo to **GitHub**
2. Go to [render.com](https://render.com) → **New → Blueprint**
3. Connect repo — Render auto-reads `render.yaml`
4. When prompted, enter a strong `SECRET_KEY` value
5. Deploy and copy the service URL

### Frontend → Vercel
1. Go to [vercel.com](https://vercel.com) → **New Project**
2. Import repo, set **Root Directory** = `frontend/`
3. Add environment variable: `VITE_API_URL` = your Render backend URL
4. Deploy!

> ⚠️ **Render free tier** spins down after inactivity — first request may take ~30s.

---

## 🛠️ Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18, Vite, Recharts, Framer Motion, Lucide Icons, Axios, React Query |
| Backend | FastAPI, SQLAlchemy 2, Pydantic v2, Uvicorn, python-jose, bcrypt |
| Database | SQLite (file-based, zero config) |
| Deployment | Vercel (frontend) + Render (backend) |
