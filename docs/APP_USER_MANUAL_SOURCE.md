# Merchant Nation Command — Complete App Walkthrough (Handbook Source)

**Purpose of this document:** This is a detailed, non-technical walkthrough of every screen and workflow in **Merchant Nation Command**. Give this file to an AI or technical writer to produce a polished user handbook, training guide, or SOP for Cooperative Bank of Oromia field staff and managers.

**App name:** Merchant Nation Command (short name on phone home screen: **MN Command**)

**Organization:** Cooperative Bank of Oromia

**Tagline / theme:** Field operations and branch management — “Growth through cooperation.”

**Production URL (example):** https://merchant-nation-2omx.vercel.app

**What the app does (one paragraph):** Merchant Nation Command is a mobile-friendly web application for field sales teams. Staff scout potential merchants on a territory map, submit recon reports, onboard (induct) merchants through a guided wizard, complete assigned missions and tasks, and earn XP, ranks, streaks, and achievements. Branch managers oversee territory boundaries, assign work, approve tasks, and review reports. Administrators configure branches, categories, ranks, and organization-wide settings.

---

## Table of Contents

1. [Who Uses the App — User Roles](#1-who-uses-the-app--user-roles)
2. [Getting Started — Login and First-Time Setup](#2-getting-started--login-and-first-time-setup)
3. [Navigation — How to Move Around the App](#3-navigation--how-to-move-around-the-app)
4. [Installing the App on Your Phone (PWA)](#4-installing-the-app-on-your-phone-pwa)
5. [The Dashboard / Map Screen (Home)](#5-the-dashboard--map-screen-home)
6. [Understanding the Map — Colors, Pins, and Filters](#6-understanding-the-map--colors-pins-and-filters)
7. [Scouting a Merchant (Recon Report)](#7-scouting-a-merchant-recon-report)
8. [Inducting a Merchant (Onboarding Wizard)](#8-inducting-a-merchant-onboarding-wizard)
9. [Missions and Tasks](#9-missions-and-tasks)
10. [Daily Report](#10-daily-report)
11. [Merchants List](#11-merchants-list)
12. [Profile — Ranks, XP, Streaks, and Settings](#12-profile--ranks-xp-streaks-and-settings)
13. [Notifications](#13-notifications)
14. [Branch Manager Guide — Territory and Oversight](#14-branch-manager-guide--territory-and-oversight)
15. [Administrator Guide — System Setup and Oversight](#15-administrator-guide--system-setup-and-oversight)
16. [Glossary of Terms](#16-glossary-of-terms)
17. [Common Questions and Troubleshooting](#17-common-questions-and-troubleshooting)
18. [Quick Reference — Typical Day by Role](#18-quick-reference--typical-day-by-role)
19. [Handbook Production Notes for the Writer](#19-handbook-production-notes-for-the-writer)

---

## 1. Who Uses the App — User Roles

There are three main roles. Each person sees different menu items and has different permissions.

### Player (Field Staff)

**Who they are:** Sales officers, scouts, and field agents who visit merchants in the field.

**What they do:**
- View their branch territory on the map
- Scout new businesses (recon reports)
- Induct (register) merchants after scouting
- Accept and complete assigned tasks
- Submit daily activity reports
- Track personal XP, rank, streak, and leaderboard position
- Connect phone notifications (push, Telegram, WhatsApp)

**What they cannot do:**
- Create missions or assign tasks to others
- Edit branch territory boundaries
- Override zone/cell status on the map
- Access admin setup screens (Branches, Ranks, Categories, etc.)
- Manage other users

**Layout:** Mobile-style screen with a **bottom navigation bar** (Map, Missions, Report, Merchants, Profile).

---

### Branch Manager

**Who they are:** Supervisors responsible for one branch’s field operations.

**What they do (everything a Player can do, plus):**
- Define and edit the branch territory boundary on the map
- Override territory cell status (UNSEEN, SCOUTED, CAPTURED, etc.)
- Create missions and assign tasks to players in their branch
- Approve or reject submitted tasks
- Create player user accounts for their branch
- Create and manage teams
- View Operational Summary, Reports, and branch merchants
- Submit daily reports

**What they cannot do:**
- Create or manage branches organization-wide
- Configure scout categories, ranks, deployment assets, or other services
- Create admin or other branch manager accounts (admin only)
- View other branches’ data (scoped to own branch)

**Layout:** Desktop **sidebar menu** on large screens; hamburger menu on mobile. Also has access to Map/Missions/Report like field staff.

---

### Administrator (Admin)

**Who they are:** Head office or IT/operations staff managing the whole organization.

**What they do:**
- View all branches on the dashboard map
- Create and manage branches
- Create users of any role (Player, Branch Manager, Admin)
- Configure scout categories, other services (competing banks), ranks, and deployment assets
- Create missions for any branch (after selecting branch)
- View organization-wide Operational Summary and Reports
- Override legacy zone status on the map

**What they cannot do:**
- Be assigned field tasks (admins are blocked from task assignment)
- Edit another branch’s territory boundary (branch manager’s job)

**Layout:** Desktop **sidebar menu** with the full admin menu list.

---

### Role Comparison Table

| Feature | Player | Branch Manager | Admin |
|---------|:------:|:--------------:|:-----:|
| Map / Dashboard | Own branch | Own branch + edit territory | All branches |
| Scout merchants | Yes | Yes | No (redirected) |
| Induct merchants | Yes | Yes | No |
| Daily report | Yes | Yes | No |
| Missions — complete tasks | Yes | Yes | No |
| Missions — create / assign | No | Yes (own branch) | Yes (any branch) |
| Approve submitted tasks | No | Yes | Yes |
| Users — create | No | Players only | All roles |
| Teams | No | Yes (own branch) | Yes |
| Branches setup | No | No | Yes |
| Scout categories | No | No | Yes |
| Ranks / Assets | No | No | Yes |
| Operational Summary | No | Yes (own branch) | Yes (all branches) |

---

## 2. Getting Started — Login and First-Time Setup

### 2.1 Opening the App

1. Open the app in a web browser (Chrome recommended on Android; Safari on iPhone) or open the installed **MN Command** icon if you added it to your home screen.
2. You land on the **Sign In** page unless you are already logged in.

### 2.2 Sign In Screen

**What you see:**
- Cooperative Bank of Oromia branding
- Title: **Merchant Nation Command**
- Subtitle about secure login / field operations
- **Email** field (placeholder example: you@bank.coop)
- **Password** field
- **Sign in** button

**Steps:**
1. Enter the email address your administrator gave you.
2. Enter your password.
3. Tap **Sign in**.

**If login fails:**
- A red error message appears (wrong email/password or server issue).
- Check caps lock and spelling.
- Contact your branch manager or admin if you forgot your password (they can reset it).

**If login succeeds:**
1. A dialog asks to **share your location**.
   - **Allow location** — recommended for field work; map centers on you and scouting uses GPS accurately.
   - **Continue without location** — you can still use the app; map uses branch territory center instead.
2. You are taken to the **Dashboard / Map** (home screen).

**Special case — temporary password:**
- If your account was created with a temporary password, you are sent to **Change Password** before you can use the app.
- See section 2.3.

### 2.3 Change Password (First Login or Later)

**When required:** First login with a temporary password.

**What you see:**
- Title: **Change your password**
- Fields: Current password, New password, Confirm new password
- Note: use your temporary password in the “Current password” field

**Steps:**
1. Enter current (temporary) password.
2. Enter new password (minimum **6 characters**).
3. Confirm new password (must match).
4. Tap **Change password**.
5. On success, you go to the Dashboard / Map.

**To change password later:** Profile → **Change password** section → expand form → **Update password**.

### 2.4 Session Timeout

- If you are inactive for about **5 minutes**, you are automatically signed out for security.
- Sign in again to continue.

### 2.5 Sign Out

1. Go to **Profile**.
2. Tap **Log out**.
3. Confirm **Stand down?** in the dialog.
4. You return to the Sign In page.

---

## 3. Navigation — How to Move Around the App

### 3.1 Player — Bottom Navigation Bar

Fixed bar at the bottom of the screen (five tabs):

| Tab | Goes to | Purpose |
|-----|---------|---------|
| **Map** | Home `/` | Dashboard + territory map |
| **Missions** | `/missions` | Your tasks and mission briefing |
| **Report** | `/report` | Submit daily field report |
| **Merchants** | `/merchants` | Scouted leads and registered merchants |
| **Profile** | `/profile` | Rank, stats, password, notifications |

The active tab is highlighted with a colored top border.

### 3.2 Branch Manager — Sidebar + Field Tabs

On desktop: collapsible **left sidebar** with logo and menu items.

**Menu order (typical):**
1. Map (home)
2. Missions
3. Report
4. Merchants (staff view)
5. Operational Summary
6. Users
7. Teams
8. Reports (admin activity view)
9. Merchants (admin pipeline view)
10. Profile

On mobile: hamburger menu opens the same items.

### 3.3 Administrator — Full Sidebar

**Menu order (typical):**
1. Dashboard
2. Missions
3. Operational Summary
4. Reports
5. Merchants
6. Users
7. Teams
8. Branches
9. Scout Categories
10. Other Services
11. Ranks
12. Deployment Assets
13. Profile

**Branch picker pattern:** Many admin screens (Users, Teams, Reports, Merchants, Missions) first show a **list of branches**. Tap a branch to see that branch’s data. Use “Back to branch list” to switch.

---

## 4. Installing the App on Your Phone (PWA)

Merchant Nation Command works as a **Progressive Web App (PWA)** — you can install it like a native app without an app store.

### Android (Chrome)

1. Open the app URL in Chrome.
2. Sign in.
3. Tap the browser menu (three dots) → **Add to Home screen** or **Install app**.
4. Confirm. An **MN Command** icon appears on your home screen.
5. Open from the icon for full-screen experience (no browser address bar).

### iPhone (Safari)

1. Open the app URL in Safari.
2. Tap the **Share** button.
3. Tap **Add to Home Screen**.
4. Name it (default: MN Command) → **Add**.

### Benefits of installing

- Quick access from home screen
- Full-screen app-like experience
- Offline shell for cached pages (live data still needs internet)
- Push notifications (if enabled in Profile)

**Note:** Push notifications require HTTPS (production URL) or localhost for testing.

---

## 5. The Dashboard / Map Screen (Home)

After login, all roles land on the **Dashboard** at `/` (Map for players).

### 5.1 Top Header Bar

| Element | Meaning |
|---------|---------|
| Green dot + **SYSTEM ACTIVE** | App is running normally |
| **ADDIS ABABA THEATER** | Geographic theater label |
| **Bell icon** | Opens Notifications page |
| Your **name** and **rank** | Your identity |
| **Profile** link / **Set name** | Go to profile or set display name |

### 5.2 Daily Muster Section

- Badge: **DAILY MUSTER** with today’s date and time (EAT — East Africa Time)
- Greeting: **Good Morning / Afternoon / Evening, [your name]**

### 5.3 Summary Stat Cards (Four Tiles)

1. **Zones Captured** — number of captured zones in your branch view
2. **Active Merchants** — registered merchants count
3. **Float Mobilized** — placeholder (shows “—” for now)
4. **Zones At Risk** — zones needing attention

### 5.4 Territory Map Section

Header: **TERRITORY MAP**

Large interactive map filling roughly half the screen (expands when editing territory).

**Map overlay bar (top of map):**
- Title: **Territory Command**
- Subtitle counts: ETHIOPIA • number of BRANCHES (if shown) • ZONES • MERCHANTS
- **FILTER** button — zone colors and branch pins
- **Fullscreen** button — expand map to full screen
- **LAYERS** button — roadmap vs satellite (Google Maps mode only; optional)
- **Edit Territory** button — **Branch Manager only**, when territory exists

**My Location button:** Floating crosshair button (bottom-right of map). Tap to center map on your GPS position.

**Bottom legend:** Shows zone status colors and pin types (Branch, Scouted, Inducted).

### 5.5 Below the Map

- **Command Leaderboard** — top performers in your branch/district; shows your rank position and XP needed for next rank
- **Officer Profile** card — your XP progress bar, zones captured, merchants inducted, missions complete (hidden for admin on dashboard)

### 5.6 Empty Map State (Player Without Territory)

If your branch manager has **not yet defined territory boundaries**, you may see:

> “Your branch manager has not set your territory yet.”

**What to do:** Ask your branch manager to define the branch boundary on the map. Until then, limited map functionality.

**Exception:** If nationwide **branch pins** (Coop branch locations) are loaded, you may still see the Ethiopia-wide map with branch markers even without a local territory polygon.

---

## 6. Understanding the Map — Colors, Pins, and Filters

### 6.1 Territory Cell / Zone Colors

Each colored area on the map has a **status**:

| Color | Status | Meaning for field staff |
|-------|--------|-------------------------|
| Dark blue | **UNSEEN** | Not yet visited or scouted |
| Light blue | **SCOUTED** | Recon completed; lead exists |
| Green | **CAPTURED** | Merchant onboarded |
| Orange | **FORTIFIED** | Strong presence / advanced status |
| Red | **AT_RISK** | Needs urgent attention |
| Dark red | **LOST** | Territory lost |

**To hide/show colors:** Tap **FILTER** → under **Show zones**, check or uncheck each status.

### 6.2 Map Pins (Markers)

| Pin appearance | What it is | Tap to see |
|----------------|------------|------------|
| Amber **bank/building icon** | Cooperative Bank branch location (nationwide) | Branch name, code, region, phone, address |
| **Blue circle** | Scouted lead (not yet registered) | Business name, category, scout details, photo |
| **Green circle** | Registered (inducted) merchant | Full merchant profile |
| **Your location** | GPS position | (centers map when using My Location) |

**To hide branch pins:** FILTER → Infrastructure → uncheck **Branches**.

### 6.3 Tapping a Territory Cell (Grid Square)

A **bottom drawer** slides up from the bottom of the screen.

**Player sees:**
- Cell code and status badge
- **Your task for this cell** (if a task was assigned) with link to task details
- **Scout This Zone** button
- **Induct Merchant** button (only if zone was scouted first; otherwise hint to scout first)
- **Merchants in this block** — tabs: All / Scouted / Registered

**Branch Manager additionally sees:**
- Status dropdown to override cell status
- Optional label field
- **Save** button
- **Create mission for this cell**
- **Assign task for this cell**

**Admin viewing another branch:** Cells are **read-only** (no Save).

### 6.4 Tapping a Map Pin

Opens a detail drawer (read-only):
- **Branch pin:** branch office details
- **Scouted pin:** lead information
- **Inducted pin:** merchant information

Scout/Induct actions are done from the **cell drawer**, not usually from pin drawer.

---

## 7. Scouting a Merchant (Recon Report)

**Purpose:** Record discovery of a potential merchant before full onboarding.

**Who can scout:** Players and Branch Managers (not Admins on dedicated scout pages).

**Ways to start scouting:**
1. Map → tap cell → **Scout This Zone**
2. Map cell drawer → embedded scout form
3. Direct link `/scout/[zoneId]` (from some flows)

### 7.1 Scout Form — “OP-01: RECON REPORT”

#### Section: Merchant Location

Choose one (required before submit):

1. **Use location from the map** — uses the cell/zone coordinates you tapped
2. **Use my current location** — uses live GPS from your phone

#### Required Fields

| Field | Description |
|-------|-------------|
| **Business name** | Name of the shop or business |
| **Business category** | Pick from list configured by admin (e.g. Cafe, Retail). If “Other”, type custom category |
| **Estimated daily volume** | LOW / MEDIUM / HIGH |

#### Optional Fields

| Field | Description |
|-------|-------------|
| **Other services used** | Multi-select — which other banks/services the merchant uses |
| **Storefront image** | Take photo with device camera |

### 7.2 Submitting the Scout Report

1. Fill all required fields.
2. Tap **TRANSMIT INTEL (+20 XP)** (may also appear as fixed bar at bottom on full-page scout).
3. **On success:**
   - Zone/cell status moves toward **SCOUTED**
   - You earn **XP** (experience points)
   - Map refreshes
   - Drawer closes (if embedded)
   - You may get an **achievement notification** (e.g. Scout Cadet at 7 scouts, Scout Officer at 14)
   - Notifications may be sent on enabled channels (in-app, Telegram, push, etc.)

4. **Cancel:** Closes form without saving (embedded mode).

### 7.3 After Scouting

- The business appears as a **scouted lead** in Merchants list and on the map (blue pin).
- You can now **Induct Merchant** for that zone.

---

## 8. Inducting a Merchant (Onboarding Wizard)

**Purpose:** Convert a scouted lead into a registered merchant with KYC and products.

**Who can induct:** Players and Branch Managers.

### 8.1 Starting Induction

**From map:** Cell drawer → **Induct Merchant** → pick a lead from list

**From Merchants page:** Scouted leads table → **Induct** button

**From Missions:** “Scouted by me” section → link to induct

**If no leads:** Message: “No unconverted leads in this zone. Scout the zone first.”

### 8.2 Account Opening Links (Top of Page)

External links to Cooperative Bank of Oromia:
- Individual account opening
- Corporate account opening

(These open bank websites in a new tab.)

### 8.3 Three-Step Wizard

#### Step 1 — Verify

- Confirm business name, category, zone
- Choose map location vs GPS location
- **Continue** or **Save and continue later** (draft)

#### Step 2 — KYC & Products

| Field | Notes |
|-------|-------|
| Owner name | Required |
| Trade license | As applicable |
| TIN | Optional |
| Phone | Format +251… |
| Merchant account number | Bank account for merchant |

Save and advance to oath step.

#### Step 3 — The Oath

- Read oath text
- Signature acknowledgment
- Tap **Complete Induction (+100 XP)**

### 8.4 After Induction

- Redirect to home map
- Merchant appears as **green pin** on map
- **+100 XP** awarded
- May trigger **scratch card** notification (check Notifications)
- Merchant appears in **Registered** merchants list

**Resume later:** Progress can be saved as draft mid-wizard.

---

## 9. Missions and Tasks

**Page:** Missions — header **MISSIONS BRIEFING**

### 9.1 What Is a Mission vs a Task?

- **Mission:** A campaign or goal for the branch (e.g. “Q2 Merchant Drive”) with optional **goals** (targets).
- **Task:** A specific assignment for one person, linked to a mission and optionally a territory cell.

### 9.2 Missions Page Sections

#### For Players

1. **MY TASKS** — tasks assigned to you; tap **View details**
2. **SCOUTED & REGISTERED BY ME** — your leads and merchants with quick links
3. **MISSIONS & GOALS** — read-only list of branch missions

#### For Branch Managers / Admins (additional)

1. **Pending Approvals** — tasks submitted by staff awaiting **Approve** or **Reject**
2. **New Mission** button (top right)
3. **Manage goals & tasks** on each mission card

### 9.3 Task Detail Page

**Path:** `/missions/task/[taskId]`

| Task status | What the assignee can do |
|-------------|-------------------------|
| **PENDING** | **Accept task** → becomes In Progress |
| **IN PROGRESS** | Add merchant reports, notes; **Submit task for approval** |
| **SUBMITTED** | Wait for manager approval (read-only) |
| **APPROVED** | Complete (read-only) |
| **REJECTED** | Final; read feedback (read-only) |

**Manager actions on submitted tasks:** Approve or Reject from Missions briefing **Pending Approvals**.

### 9.4 Creating a Mission (Manager / Admin)

1. Missions → **New Mission**
2. Enter **Name**, **Status** (e.g. DRAFT, ACTIVE)
3. Admin: select **Branch** if prompted
4. **Create Mission**
5. Open mission → **Add goal** (title, target value, unit)
6. **Assign task** (title, description, assign to player)

**Alternative:** Map → tap cell → **Create mission for this cell** or **Assign task for this cell**

### 9.5 Task Assignment Rules

- Branch managers assign only to **PLAYER** role in their branch
- Admins assign within selected branch
- Admins cannot be task assignees
- Assignee receives notifications on enabled channels (in-app, Telegram, push, etc.) when task is assigned

---

## 10. Daily Report

**Page:** Report — header **DAILY REPORT**

**Who can submit:** Players and Branch Managers only (Admins are redirected away).

### Steps

1. Open **Report** from bottom nav (player) or sidebar (manager).
2. **Date** — defaults to today; change if reporting for another day.
3. **What you did** — required text area describing your field activities.
4. Tap **Submit report**.
5. Success: “Report submitted.” Field clears.
6. Error: e.g. duplicate report for same date — adjust and retry.

**Who reads reports:** Branch managers via **Reports** (admin section) and **Operational Summary**.

---

## 11. Merchants List

**Page:** Merchants

**Who uses it:** Players and Branch Managers (branch-scoped).

### Filters

- **View:** All | Scouted | Registered
- **Category** dropdown
- **Search** by business or owner name

### Scouted Leads Table

Columns: Business, Category, Volume, Scouted by, Date, **Induct** action.

### Registered Merchants Table

Tap row → bottom drawer with full merchant details.

### Edit Permissions

| Role | Can edit |
|------|----------|
| Player | Merchants **they** inducted only |
| Branch Manager | Any merchant in their branch |

**Edit form fields:** Owner name, IDs, phone, account, deployment assets checkboxes.

---

## 12. Profile — Ranks, XP, Streaks, and Settings

**Page:** Profile — header **OFFICER PROFILE & RANKS**

### 12.1 Officer Identity Card

- Avatar initials, display name, rank, team
- **Rank progression track** — stages (R1, R2, R3…) with XP ranges
- Progress bar to next rank
- **Set name** — change display name

### 12.2 Scout Badge Progress

Milestones:
- **Scout Cadet** — 7 scouts
- **Scout Officer** — 14 scouts

Shows unlocked vs remaining.

### 12.3 Operations Overview

Live stats:
- Cells scouted
- Zones captured
- Merchants inducted
- Missions complete

### 12.4 Streak Tracker

- **Current streak** (consecutive days with activity)
- **Personal best** streak
- **Freeze shields** — earned every 10 days; protect streak if you miss a day
- Milestones: 7, 14, 21, 30, 50, 100, 365 days
- Daily glow animation when active today

**How to maintain streak:** Perform qualifying activity (e.g. submit a scout report) each day.

### 12.5 Contribution Heatmap

- Year-long grid (similar to GitHub contribution graph)
- Toggle **Scouts** vs **Merchants**
- Hover/tap a day for counts
- Stats: total activity, active days, most active day

### 12.6 Global Performance / Leaderboard

- Top 3 podium + full branch leaderboard
- Columns: Player, Scouts, Manager, Zone, XP
- Your row marked **(you)**

### 12.7 Change Password

Expand section → current password, new password, confirm → **Update password**.

### 12.8 Connect Phone Notifications

| Channel | How to enable |
|---------|---------------|
| **Push (browser/phone)** | **Enable Push** → allow browser notification permission |
| **Telegram** | **Connect Telegram** → opens bot → press **Start** in Telegram chat |
| **WhatsApp** | Enter phone (+251…) → **Save Number** |

Status shows **Connected** or **Not connected** for each.

**Quiet hours:** System may delay non-urgent notifications during configured quiet hours (default evening to morning).

### 12.9 Scratch Cards and Daily Challenges

- Scratch cards are **earned** when you induct merchants (rewards vary).
- Notification: “You Earned a Scratch Card!” — check **Notifications** page.
- Scratch card and daily challenge UI components exist; primary access today is via **notifications** pointing to Profile.

---

## 13. Notifications

### 13.1 Types of Notifications

| Type | Example message |
|------|-----------------|
| Task assigned | New task assigned: [mission]: [title] |
| Scout submitted | Scout submitted — business added |
| Achievement | Achievement Unlocked! + XP |
| Streak milestone | Streak Milestone! X-day streak |
| Streak reminder | Keep your streak alive |
| Streak at risk | Streak at risk (urgent) |
| Scratch card | You Earned a Scratch Card! |
| Weekly progress | Weekly Progress summary |
| Mission / branch | New mission assigned (branch-wide) |

### 13.2 In-App Popup (While Using App)

- Checks for new notifications every ~12 seconds
- **“New notifications”** dialog opens automatically
- Bell sound plays (can **Mute sound**)
- Buttons: **View all**, **Mark all as seen**

### 13.3 Notifications Page

**Path:** `/notifications` (also via bell icon on dashboard)

- List of all notifications
- Unread items highlighted
- **Mark as seen** per item or **Mark all as seen**
- Links: **View task**, **View mission**

### 13.4 External Channels

If connected in Profile:
- **Telegram** — messages to your Telegram app
- **WhatsApp** — messages to your WhatsApp number
- **Push** — phone/browser push when app is in background (requires installed PWA + permission)
- **Email** — if configured by organization

---

## 14. Branch Manager Guide — Territory and Oversight

### 14.1 Defining Branch Territory (First Time)

1. Sign in as Branch Manager → **Map** (home).
2. If no territory exists, map shows: “Click 4+ points on the map to define your territory.”
3. Click at least **4 corners** on the map outlining your branch area.
4. Banner shows point count.
5. Tap **Save Territory**.
6. System creates territory **grid cells** inside the polygon.
7. Staff in your branch can now scout within those cells.

### 14.2 Editing Territory Boundary

1. On map overlay, tap **Edit Territory**.
2. Drag existing corner points or click map to add points.
3. Tap **Save Territory** or **Cancel**.
4. Map refreshes with updated cells.

**Minimum:** 4 distinct points required.

### 14.3 Overriding Cell Status

1. Tap a colored cell in your branch territory.
2. In drawer, change **Status** dropdown.
3. Optionally add **Label** (e.g. “North sector”).
4. Tap **Save**.

Use when field data needs correction without re-scouting.

### 14.4 Operational Summary

**Path:** Operational Summary (sidebar)

**Filters:** Date range, category (if categories exist). Data scoped to your branch automatically.

**What you see:** KPI cards, charts (tasks, leads, merchants, missions, territory health), summary tables.

**Link:** “Daily reports & activity log” → Reports page.

### 14.5 Users (Branch Manager)

- **Create User** — name, email, password; role locked to **PLAYER**; optional team
- **Edit** — name, team
- **Reset password** — sets new temporary password

Cannot change roles to Admin or Branch Manager.

### 14.6 Teams

- **Create Team** — team name (auto-assigned to your branch)
- Used to organize players for reporting and structure

---

## 15. Administrator Guide — System Setup and Oversight

### 15.1 Branches

**Path:** Branches (sidebar)

- **Create Branch** — Name, Location, optional Branch code
- Each branch row has shortcuts: Operational Summary, Missions, Reports, Users, Teams
- After creating branch: assign a **Branch Manager** user via Users screen
- Branch Manager then defines territory on map

### 15.2 Scout Categories

**Path:** Scout Categories

- **Add category** — Name (unique), Display name, Icon, Display order, Active flag
- Categories appear in scout form dropdown
- Deactivate instead of delete if still referenced

### 15.3 Other Services

**Path:** Other Services (external banks / competing services)

- **Add other service** — name (e.g. “CBE”, “Awash Bank”)
- Appears in scout form “Other services used” multi-select

### 15.4 Ranks

**Path:** Ranks

- **Add rank** — Name, Code, Min XP, Display order
- Defines XP progression ladder shown on Profile and leaderboard
- Example ranks: Cadet, Officer, Commander (configured by organization)

### 15.5 Deployment Assets

**Path:** Deployment Assets

- **Add asset** — Military name, Display name, Description, deployment steps, doc link, icon, Status (ACTIVE/INACTIVE/DEPRECATED)
- Shown during merchant induction for staff to record what was deployed (POS, etc.)

### 15.6 Users (Admin)

- Create any role: PLAYER, BRANCH_MANAGER, ADMIN
- **Edit Role** — change user’s role
- **Reset password**
- Filter by branch via branch list entry

### 15.7 Reports (Admin)

1. Pick branch from list
2. Set date range and optional action filter
3. Review **Daily reports** from staff
4. Review **Activity log** (logins, scouts, inductions, status changes, etc.)

### 15.8 Admin Map View

- Sees **all branch territories** on one map (read-only cells)
- **Branch pins** (nationwide Coop locations) visible when layer enabled
- Cannot edit another branch’s territory boundary

---

## 16. Glossary of Terms

| Term | Plain-language definition |
|------|---------------------------|
| **Scout / Recon** | Visit a business and submit a discovery report before full onboarding |
| **Lead** | A scouted business not yet registered as a merchant |
| **Induct / Induction** | Full merchant onboarding wizard (KYC + oath) |
| **Merchant** | Registered business after successful induction |
| **Territory / Cell** | Grid square on branch map representing a geographic block |
| **Zone** | Legacy grid area (older system; still visible on some maps) |
| **Mission** | Branch campaign with goals |
| **Task** | Assignment for one person, linked to a mission |
| **XP** | Experience points earned from scouts, inductions, achievements |
| **Rank** | Title based on total XP (Cadet, Officer, etc.) |
| **Streak** | Consecutive days with qualifying activity |
| **Freeze shield** | Streak protection earned every 10 active days |
| **Heatmap** | Year-long visual of daily scout/merchant activity |
| **Operational Summary** | Manager/admin dashboard of KPIs and charts |
| **Deployment asset** | Equipment or service deployed to merchant (e.g. POS) |
| **PWA** | Installable web app on phone home screen |
| **Branch pin** | Map marker for a Cooperative Bank branch office location |

---

## 17. Common Questions and Troubleshooting

### I cannot sign in

- Verify email and password with your manager.
- Ask admin/manager to **reset password**.
- Check internet connection.
- Try a different browser (Chrome recommended).

### I was logged out automatically

- Session expires after ~5 minutes of inactivity. Sign in again.

### Map is blank or not loading

- Check internet connection.
- Refresh the page.
- Allow location if prompted.
- If message says territory not set, contact branch manager.

### I don’t see my branch territory

- Branch manager must **Save Territory** with at least 4 map points first.

### Scout form won’t submit

- Ensure business name, category, and daily volume are filled.
- Select map location or “use my current location”.
- Enable GPS/location permission in phone settings.

### Induct button is missing

- **Scout the zone first** — induction requires an existing scouted lead.

### Push notifications say “not configured”

- Organization must set up push keys on server. Use Telegram or WhatsApp instead, or contact IT.

### Telegram won’t connect

- Tap Connect Telegram → open bot link → press **Start** in Telegram.
- Ensure you complete the bot handshake.

### I don’t receive task notifications

- Check Profile → notification channels are connected.
- Ensure task was assigned to **you** (not someone else).
- Check Notifications page for in-app messages.

### Admin screen says “Select a branch”

- Normal for admin. Pick a branch from the list to continue.

### App works in browser but not installed on phone

- Use **Add to Home Screen** (see section 4).
- Production URL must use **HTTPS**.

### Offline message

- Cached pages may load offline, but live scouting, reports, and map data need internet.

---

## 18. Quick Reference — Typical Day by Role

### Field Staff (Player)

1. Sign in → allow location
2. Open **Map** → tap cell → **Scout This Zone** → submit recon
3. Same cell → **Induct Merchant** → complete 3-step wizard
4. **Missions** → accept task → add work → submit for approval
5. **Report** → submit daily summary
6. **Profile** → check streak, rank, connect Telegram/push

### Branch Manager

1. Review **Operational Summary**
2. Check **Pending Approvals** on Missions
3. **Assign tasks** from map cells or mission detail
4. Review **Reports** from staff
5. Field work: scout/induct same as player
6. Maintain territory boundary if areas change

### Administrator

1. Monitor **Operational Summary** (all branches)
2. **Users** — create accounts, reset passwords
3. **Branches / Categories / Ranks / Assets** — maintain configuration
4. **Reports** — audit branch activity
5. **Missions** — create branch campaigns as needed

---

## 19. Handbook Production Notes for the Writer

When converting this document into a formal user handbook, consider:

### Suggested handbook structure

1. **Cover page** — Merchant Nation Command, Cooperative Bank of Oromia, version date
2. **Introduction** — purpose, audience, how to get help
3. **Chapter 1: Getting started** — sections 2, 3, 4
4. **Chapter 2: Field operations (Players)** — sections 5–12
5. **Chapter 3: Branch management** — section 14
6. **Chapter 4: Administration** — section 15
7. **Chapter 5: Reference** — glossary, troubleshooting, quick reference
8. **Appendix** — notification types, status color chart (print-friendly), role permission matrix

### Screenshots to capture (recommended)

- Login screen
- Location permission dialog
- Dashboard with map and stat cards
- Map FILTER panel open
- Cell drawer (scout + induct buttons)
- Scout form (OP-01 RECON REPORT)
- Induction wizard (all 3 steps)
- Missions briefing with pending approvals
- Task detail (accept / submit)
- Daily report form
- Merchants list with filters
- Profile — streak, heatmap, rank track
- Notification popup and notifications list
- Branch manager — Edit Territory mode
- Admin — branch list, create user, create branch
- PWA “Add to Home Screen” on Android and iPhone

### Tone guidelines

- Use **plain English**; avoid developer terms (API, server action, JSON).
- Use **“tap”** for mobile and **“click”** for desktop, or use **“select”** for both.
- Address the reader as **“you”**.
- Use **Cooperative Bank of Oromia** full name on first mention; “the Bank” thereafter.
- Keep step numbers for all procedures.

### Branding elements to preserve

- App name: **Merchant Nation Command**
- Short name: **MN Command**
- Theme color: blue `#00ADEF`
- Cooperative Bank of Oromia logo on login and sidebar
- Military/command theme labels: Daily Muster, Territory Command, Officer Profile, TRANSMIT INTEL, Stand down (logout)

### Items that may change

- Production URL (use your organization’s live link)
- Test login credentials (do not publish real passwords in public handbook)
- Float Mobilized stat (currently placeholder)
- POS machine map layer (disabled in current version)
- Scratch card UI on Profile (may be added to Profile page in future)

### Document metadata

- **Source:** Merchant Nation Command codebase walkthrough
- **Intended audience:** Non-technical bank staff (players, branch managers, administrators)
- **Last aligned with app features:** June 2026

---

*End of handbook source document.*
