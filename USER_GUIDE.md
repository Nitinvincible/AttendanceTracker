# 📖 AttendTrack — User Guide

A step-by-step guide to using the AttendTrack application.

---

## 1. First Launch — Pick Your Sector

When you open the app for the first time, you'll see a **sector selection screen**.

| Option | Best For |
|--------|----------|
| 🏥 **Medical** | Hospitals, clinics, nursing staff |
| 💼 **Corporate** | Offices, teams, projects |
| 🏛️ **Government** | Departments, ministries, officers |
| 🎓 **Education** | Schools, colleges, courses |

Click your sector — the app will **remember your choice** across sessions. You can switch it anytime from the bottom of the sidebar.

---

## 2. Dashboard

The **Dashboard** is your home screen (`/`). It gives you an at-a-glance overview.

### Stat Cards (top row)
| Card | What it shows |
|------|--------------|
| Total Members | How many employees/students are enrolled |
| Present Today | Count marked present for today's date |
| Absent Today | Count marked absent for today's date |
| Attendance Rate | `(Present ÷ Total) × 100` for today |

### 7-Day Chart
A bar chart comparing **Present vs Absent** for each of the last 7 days. Hover a bar for exact numbers.

### Today's Summary (right panel)
Progress bars breaking down Present / Absent / Not Marked for today, plus the overall attendance rate percentage.

### Recent Attendance Records (bottom)
A full table of all saved attendance records, **grouped by date** (newest first). Each group shows:
- A **date header** with quick present/absent pill counts
- A table of every member with their status (✓ Present / ✗ Absent)

> 💡 If this section is empty, go to **Attendance** and save records first.

---

## 3. Members — Manage Employees / Students

Navigate to **Members** from the sidebar.

### View & Search
- All enrolled members are listed in a table
- Use the **search bar** to filter by name, ID, or group in real time

### Add a Member
1. Click **+ Add Member** (top right)
2. Fill in:
   - **Full Name**
   - **ID** (Staff ID / Roll Number / Employee ID — must be unique)
   - **Group** (Ward / Team / Department / Class)
3. Click **Add Member** — they appear in the table immediately

### Edit a Member ✏️
1. Click the **pencil icon** on any row
2. The same form opens, pre-filled with existing data
3. Change what you need → click **Save Changes**

> ⚠️ The ID field must remain unique. You'll see an error if the ID is already taken by someone else.

### Delete a Member 🗑️
1. Click the **trash icon** on any row
2. Confirm the prompt
3. The member and **all their attendance records** are permanently removed

---

## 4. Mark Attendance

Navigate to **Attendance** from the sidebar.

### Workflow
1. **Select a date** using the date picker (top right) — defaults to today
2. Each member appears as a row with a **toggle button**:
   - 🟢 **Present** — green, click to switch to Absent
   - 🔴 **Absent** — red, click to switch to Present
3. Use **All Present** or **All Absent** buttons to set everyone at once
4. Click **Save Attendance** when done

### Re-submitting
Submitting attendance for a date you've already saved **overwrites** the previous records for that date. This is intentional — use it to correct mistakes.

---

## 5. Switching Themes

At the **bottom of the sidebar**, you'll find a sector switcher. Clicking a different sector immediately:
- Changes the accent color scheme
- Updates all labels (e.g. "Staff Member" → "Employee")
- Persists to your next session via `localStorage`

---

## 6. Tips & Tricks

- **Start fresh each day** — the dashboard "Present Today" and "Absent Today" update automatically based on the current date
- **No internet needed** — the app runs fully locally (SQLite database, no cloud DB required)
- **History never deletes itself** — old attendance records remain visible in the Dashboard records table even after weeks
- **Swagger UI** — if you're a developer, visit `http://localhost:8000/docs` to explore and test all API endpoints directly in the browser

---

## 7. Troubleshooting

| Problem | Fix |
|---------|-----|
| Dashboard shows 0 for everything | No attendance has been saved yet — go to **Attendance** and save records |
| "Roll number already exists" error | The ID you entered is already taken by another member |
| Backend not responding | Make sure `uvicorn main:app --reload` is running in the `backend/` folder |
| Frontend blank page | Make sure `npm run dev` is running in the `frontend/` folder |
| Render API is slow on first request | Free tier hibernates — wait ~30s for it to wake up |
