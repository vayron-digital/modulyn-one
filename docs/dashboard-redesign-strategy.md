# Modulyn One Dashboard Redesign Strategy

## Overview

This document outlines the strategic redesign of the Modulyn One Dashboard, transforming it into a powerful, ready-to-use operational core for businesses. The redesign leverages Modulyn’s philosophy of scalability, configurability, and control, with a focus on multi-tenancy, feature toggling, and centralized UI configuration.

---

## 1. High-Level Design Concepts

- **Dashboard as Operational Core:** The dashboard is the command center, surfacing what matters most, right now, in a visually clear, actionable, and customizable way.
- **Philosophy:** Modular, real-time, role-aware, and tenant-configurable.

---

## 2. Layout & Grid System

- **12-column responsive grid** (Tailwind CSS grid/flex utilities).
- **Widget-based layout:** Each dashboard element (KPI, chart, feed, etc.) is a draggable, resizable widget.
- **Breakpoints:** Mobile (stacked), Tablet (2-3 columns), Desktop (4-6 columns).
- **Widget “zones”:**
  - Primary: Critical KPIs
  - Secondary: Activity, chat, notifications
  - Tertiary: Trends, analytics, custom widgets

---

## 3. Visual & UI Configuration

- **Centralized theme provider:** All colors, spacing, typography, and widget styles are controlled via a global config.
- **Light/Dark mode:** Toggleable, with tenant branding overrides.
- **Whitespace & clarity:** Ample padding, clear sectioning, minimal visual noise.
- **Consistent iconography:** For trends, actions, and navigation.

---

## 4. Core Widgets & KPIs

### Founder View (Default)
- Total Revenue (MTD/YTD, trend arrow)
- New Leads (today/this week)
- Conversion Rate (%)
- Active Users (last 24h)
- Churn Rate
- Key Activities (calls, meetings, deals closed)
- Proactive Insights (overdue tasks, stagnant leads, unread messages, critical notifications)
- Trends (revenue over time, lead sources, activity heatmap)

### Sales Manager View
- Pipeline Value
- Calls Made
- Meetings Booked
- Deals Won/Lost
- Top Performers
- Quick Actions ("Call Now", "Assign Lead")

### Support Agent View
- Open Tickets
- Avg. Response Time
- Customer Satisfaction (CSAT)
- Unresolved Issues
- Quick Actions ("Reply to Ticket", "Escalate Issue")

---

## 5. Real-Time Data & Visual Feedback

- **Live updates:** Supabase subscriptions for KPIs, activity, chat, notifications.
- **Visual cues:** Subtle highlight on update, up/down arrows for trends, animated counters for new messages/notifications.
- **Activity Feed:** Real-time, scrollable, filterable.
- **Chat & Notifications:** Slide-in panels or popovers, accessible from dashboard header.

---

## 6. Interaction Model for Customization

- **Edit Mode:** "Customize Dashboard" button toggles drag-and-drop mode.
- **Widget Library:** Side panel with available widgets (filtered by enabled modules).
- **Settings Panel:** Per-widget and global settings.
- **Save/Reset:** "Save Layout" and "Reset to Default" options.

---

## 7. Dynamic Module Integration

- **Feature toggles:** Dashboard queries enabled modules for tenant/user. Only relevant widgets are shown.

---

## 8. Seamless Integration of Real-Time Elements

- **Activity Feed:** Always visible, collapsible, real-time updates.
- **Chat:** Persistent icon in header, overlay or side panel, real-time.
- **Notifications:** Bell icon, dropdown for recent alerts, critical notifications can pin to dashboard.

---

## 9. “Next Best Actions” & Proactive Prompts

- **AI/Rules Engine:** Widget or section: “What Needs Your Attention” with actionable prompts.
- **Visuals:** Highlighted cards, colored borders, or subtle animation to draw attention.

---

## 10. Technical Considerations

- **Widget system:** Each widget is a React component, receives props for data, config, and real-time updates.
- **State management:** Context API or Zustand for dashboard state. Supabase for real-time data and user preferences.
- **Performance:** Lazy load widgets, debounce real-time updates, optimize queries.
- **Accessibility:** Keyboard navigation, ARIA labels, color contrast.

---

## 11. Example: Core KPIs by Role

| Role           | KPIs/Widgets (Default)                                                                 |
|----------------|---------------------------------------------------------------------------------------|
| Founder        | Revenue, New Leads, Conversion Rate, Active Users, Churn, Key Activities, Insights    |
| Sales Manager  | Pipeline Value, Calls Made, Meetings, Deals Won/Lost, Top Performers, Quick Actions   |
| Support Agent  | Open Tickets, Avg. Response Time, CSAT, Unresolved Issues, Quick Actions              |

---

# Project Task Tracker

## Progress & Next Steps

- [x] **Create this strategy markdown file**
- [x] Design and implement the flexible grid system and widget layout  
  _Initial audit and planning for the grid system and widget containers is complete. Next: Scaffold the grid and widget system in code._
- [x] Scaffolded the grid and widget system in code. DashboardV2 now uses the Widget component for all dashboard sections, enabling modularity.
- [x] Built the widget registry and created the first modular widget (NewLeadsWidget). DashboardV2 now uses this modular widget for New Leads.  
- [x] Modularized OverdueTasksWidget and registered it. Both left-column widgets are now modular.  
- [x] Modularized all main KPI widgets (TotalLeadsWidget, ActiveTasksWidget, PropertiesWidget) and registered them. All main KPI cards are now modular.  
- [x] Modularized all remaining dashboard widgets (RevenueLeadsChartWidget, RecentActivityWidget, SalesPipelineWidget, TodoListWidget) and registered them. The dashboard is now fully composed of modular, registry-driven widgets.  
  _Next: Implement role-based default layouts and KPIs for Founder, Sales Manager, and Support Agent views._
- [ ] Implement role-based default layouts and KPIs for Founder, Sales Manager, and Support Agent views.
- [ ] Integrate real-time data using Supabase subscriptions for KPIs, activity, chat, and notifications.
- [ ] Add customization features: drag-and-drop, widget library, and settings panel for dashboard personalization.
- [ ] Centralize UI configuration (theme provider, tenant overrides) for global aesthetics and branding control.
- [ ] Integrate activity feed, chat, and notifications into the dashboard layout with real-time updates.
- [ ] Implement “Next Best Actions”/AI insights widget to surface actionable prompts and recommendations.
- [ ] Optimize dashboard for performance and accessibility (lazy loading, ARIA, keyboard navigation, etc.).
- [ ] Document and test all features, updating the strategy markdown file with progress and learnings.

---

**This document will be updated as each milestone is completed.** 