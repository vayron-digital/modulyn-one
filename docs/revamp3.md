**Project: CRM Revamp - Customer Journeys Focus**

**Objective:** To completely revamp our existing CRM, transforming it into a highly visual, intuitive, and efficient platform that centralizes customer journey management, enhances team productivity, and provides actionable insights. The goal is to align the CRM's functionality and aesthetics with the provided design concepts (image_6090a5.jpg, image_6090e3.jpg, image_6090c4.jpg, image_608dfd.jpg).

**Image Descriptions and Key Visual References:**

* **image\_6090a5.jpg, image\_6090e3.jpg, image\_6090c4.jpg, image\_608dfd.jpg:** These images consistently showcase a sleek, modern CRM interface displayed on a tablet-like device. The dominant colors are various shades of white, light grey, and subtle off-white for backgrounds and cards, with black text and occasional pops of color (like the red circles on some avatars or the blue "Executed" status). The overall aesthetic is clean, spacious, and professional.
    * **Layout:** The main content area is divided into logical, card-based sections, illustrating workflows and information clusters. These cards have soft, rounded corners and subtle drop shadows, giving them a slight lift off the background.
    * **User Avatars:** Throughout the interface, especially within the workflow cards and the top navigation, small circular profile pictures (avatars) of individuals are prominently displayed, often with numbers or colored indicators.
    * **Workflow Visualization:** The most striking feature is the visual representation of "Customer Journeys" through interconnected cards. These cards denote individual tasks or stages, linked by thin, dashed grey lines that indicate flow and dependencies.
    * **Data Presentation:** Information like "Suggested Knowledge" and "Support Ticket Journey" is presented at the bottom, using a table-like format for knowledge and donut/pie charts for the support journey, all within the same clean, card-based design language.

**Key Areas for Revamp & Guidance:**

1.  **Visual Design and Layout:**
    * **Inspiration:** The provided images are the primary visual reference. The CRM should adopt this clean, modern, and spacious aesthetic with a focus on white space, soft rounded corners, and subtle shadows for depth on interactive elements and content blocks.
    * **Overall Structure:** Replicate the multi-column, card-based layout evident in the "New Case Management" section. Each card represents a step or a task within a journey.
    * **Font:** Use "Lufga" font consistently throughout the entire CRM interface for all text elements.

2.  **Navigation Structure - Crucial Clarification:**
    * **Top Navigation (Primary Page Navigation):** As clearly seen in the images, the main navigation to different core CRM modules (e.g., "Relationship," "Opportunities," "Leads," "Calendar," "Cases," "Reports," "Quotes") is positioned horizontally at the very top of the screen, adjacent to the "sugar crm" logo. This top bar acts as the primary page switcher and is the main way to navigate between modules/pages. **This top navigation replaces the function of our current sidebar, but in a much sleeker and more modern way.** The currently active page, "Cases" in the images, is distinctly highlighted (black background with white text).
    * **Left-Standard-Sidebar (Page-Specific Options/Tools):** The slim vertical bar on the far left of the screen is *not* for navigating between major CRM pages. Instead, it serves as a sidebar for *options and tools specific to the currently active page*. For the "Customer Journeys" page displayed, this sidebar contains icons for actions like sharing, uploading, favoriting, adding new items, viewing a list, viewing settings, and accessing alerts. These are contextual tools for managing customer journeys, not global navigation. This distinction is critical for the UI/UX.
    * **Reference:** See the attached images for a visual example of this navigation structure.

3.  **Core Feature: Customizable Workflows & Journey Mapping:**
    * **Central Concept:** The "Customer Journeys" dashboard (as seen in the images) is paramount. This should be the default view when the "Cases" page is selected from the top navigation.
    * **Workflow Visualization:** Implement a highly configurable interface to build custom workflows. Users should be able to define stages (e.g., "Case Allocation," "Issue Identification," "Technical Resolution," "Request Processing," "Problem Resolution") and sub-tasks within each stage. These stages are visually distinct columns of cards.
    * **Card-Based Tasks:** Each task within a workflow stage should be represented by a distinct card. These cards clearly display the assigned user (avatar), task description, and status icons (e.g., checkmark for completion, calendar for due date, document icon for notes).
    * **Connectors/Flow Lines:** Visualize the progression of tasks and stages using thin, dashed grey connecting lines/arrows, similar to those seen between cards and stages (e.g., from "Technical Resolution" to "Request Processing").
    * **Dynamic Updates:** As tasks are completed, the UI should dynamically update to reflect progress within the journey, including status changes on cards and the movement of cases through stages.
    * **Journey Templates:** Allow for the creation and saving of custom journey templates (e.g., "New Case Management," "Support Ticket Journey") that can be easily applied to new cases, as suggested by the section titles.

4.  **Advanced Analytics & Reporting (Integrated with Journeys):**
    * **Journey-Specific Insights:** Beneath the main journey view, incorporate an "Advanced Analytics" section, visually represented by concise charts or summaries, as hinted by the "Support Ticket Journey" section at the bottom of the images. This section shows a donut chart with numbers ("5 Executed," "7 Active").
    * **Key Metrics:** Focus on displaying actionable insights related to customer journeys, such as:
        * Average resolution time per case/journey type.
        * Bottlenecks in workflows (e.g., stages with high dwell time).
        * Team performance within specific journey stages.
        * Customer satisfaction scores tied to completed journeys.
    * **Drill-Down Capability:** Users should be able to click on these insights to access more detailed reports and data visualizations.

5.  **Task Management (Scheduled Assignments & Customizable Schedules):**
    * **Integrated Task Creation:** Users should be able to create tasks directly within the journey stages or as standalone items. The "+" icon on cards/sections indicates this functionality.
    * **Automated Assignments:** Implement rules for automatically assigning tasks based on case type, customer segment, or workflow stage.
    * **Scheduling & Reminders:**
        * Allow users to set due dates and times for individual tasks.
        * Enable recurring task assignments for ongoing processes (e.g., weekly check-ins).
        * Implement customizable notification settings for task assignments, upcoming deadlines, and overdue tasks.
        * As seen in the "Suggested Knowledge" section, tasks should include "Subject," "Status" (e.g., "Executed"), "Start Date," "End Date," and "Assigned User" fields in a clear, tabular format.

6.  **User Experience (UX) Enhancements:**
    * **Intuitive Drag-and-Drop:** Where applicable (e.g., reordering tasks, moving cases between stages), implement smooth drag-and-drop functionality.
    * **Clear Status Indicators:** Use visual cues (colors, icons, text labels like "Executed," "Active") to clearly indicate the status of tasks, cases, and journeys.
    * **Search and Filter:** Ensure robust search (magnifying glass icon in top right) and filtering capabilities for cases, tasks, and knowledge articles.
    * **User Avatars:** Display user avatars prominently for assigned tasks and team members, as shown in the images, to enhance visual recognition and quick identification.
    * **Contextual Information:** When hovering or clicking on a task/card, provide quick access to relevant contextual information (e.g., customer details, case history).
    * **"Suggested Knowledge" Section:** Incorporate a section similar to "Suggested Knowledge" at the bottom, providing quick access to relevant articles or resources to aid in task completion. This section's design (clean, tabular, with status and dates) should be replicated.
    * **Action Icons:** Replicate the icons on cards for "complete task" (checkmark) and "more options" (three dots). Also, the upload/download icons and new item icons visible in the top right and left sidebar should be implemented.

**Specific Elements to Replicate/Implement from Images:**

* **"New Case Management" Section:** Recreate the exact layout with cards for "Allocate Case to User," "Acknowledge Case receipt to customer," including the user avatars on each.
* **"Issue Identification" Section:** Implement the specific tasks shown: "Identify Issue Category," "Identify Issue Severity," "Identify Issue Impact," "Allocate to Resolution Team," "Advise Customer of Resolution estimate."
* **"Technical Resolution" Section:** Include "Identify Issue Dependencies," "Identify Issue Resolution," "Estimate Resolution Time," "Advise Customer of Resolution Estimate," and "Advise Customer Issue Resolved."
* **"Request Processing" and subsequent stages:** "Problem Resolution," "Customer Communication," "Testing and Verification," "Customer Notification," "Customer Satisfaction."
* **Add/Remove Functionality:** The "+" and trashcan icons on cards/sections should be functional for adding new tasks/elements and deleting them.
* **Checkmark Icons:** Implement the checkmark icons on completed tasks.
* **User Avatars:** Ensure realistic user avatars are used throughout.

By following these detailed instructions, paying close attention to the visual cues and navigation specifics from the provided images, and integrating the defined functionalities, we aim to transform our CRM into a powerful and user-friendly "Customer Journeys" platform.