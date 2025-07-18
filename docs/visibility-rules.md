# CRM Role-Based Visibility Rules

Defines visibility of CRM features for `admin` and `non-admin` users. Use this for enforcing UI/route/module access restrictions.

---

## GLOBAL

- Bulk Upload (CSV/Excel): `admin` only
- Sidebar Items: visible to `admin` only — includes:
  - User Management
  - Calls
  - Leads
  - Projects
  - Scheduler
  - Reports
  - Settings

---

## USER MANAGEMENT

- `admin` only:
  - Users List
  - Add User
- Team Hierarchy:
  - `admin`: full access
  - `non-admin`: `read-only`

---

## CALLS MODULE

- Add/View Calls:  
  - `admin`: full access  
  - `non-admin`: full access (own or assigned data)
- Fields include: Name, Mobile, Email, Agent, Date, Source, Priority, Comments

---

## LEADS MODULE

- Sidebar: Leads → visible to both roles
- REGULAR & EVENT Leads:
  - Add/View/Open/Closed/Deal Closed/Junk/Confirmed/Walk-Ins:
    - `admin`: full access
    - `non-admin`: full access
- Compliance Onboarding:
  - `admin` only
- Dumped Leads Page + Move to Dumped Action:
  - `admin` only

---

## PROJECTS MODULE

- Projects List:
  - `admin`: full access
  - `non-admin`: `read-only`
- Developers, Amenities, Cities (CRUD):
  - `admin` only
- Add Project:
  - `admin` only

---

## SCHEDULER MODULE

- Scheduler View/Add/Edit:
  - `admin`: full access
  - `non-admin`: access to own/team entries only

---

## REPORTS MODULE

- Visible to `admin` only:
  - Team Leader Performance
  - Sort Reports
  - Export Active Leads
  - Seniority
  - Assess Reports
  - Users Activity
- Visible to `non-admin`:
  - Agents Performance
  - Done Cold Calls
  - Agent Activity
  - Lead Counts Per Agent
  - Daily Reports

---

## SETTINGS MODULE

- General Settings: `admin` only
- Campaign/Event Management:
  - Event Master, Campaign Master: `admin` only
  - Sources Master, Status Groups Master, Status Master, Sub Status Master: `admin` only

---

## SUMMARY

```json
{
  "admin": [
    "All modules and features",
    "User management",
    "Project management",
    "Settings and campaign tools",
    "Full reports"
  ],
  "non-admin": [
    "View/add own calls and leads",
    "View project info",
    "Use scheduler",
    "View limited performance reports",
    "Read-only team hierarchy"
  ]
}
