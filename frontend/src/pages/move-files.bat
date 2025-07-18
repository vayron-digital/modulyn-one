@echo off
cd /d %~dp0

:: Move leads files
move Leads.tsx leads\
move AddLead.tsx leads\
move EditLead.tsx leads\
move LeadDetails.tsx leads\
move DumpedLeads.tsx leads\
move LeadsList.tsx leads\
move NewLead.tsx leads\
move LeadForm.tsx leads\
move LeadsPage.module.css leads\

:: Move properties files
move Properties.tsx properties\
move PropertyForm.tsx properties\
move PropertyDetails.tsx properties\

:: Move calls files
move Calls.tsx calls\
move AddCall.tsx calls\
move NewCall.tsx calls\
move UploadCalls.tsx calls\
move CallsList.tsx calls\

:: Move scheduler files
move Scheduler.tsx scheduler\
move Calendar.tsx scheduler\

:: Move tasks files
move Tasks.tsx tasks\
move AddTask.tsx tasks\
move NewTask.tsx tasks\
move Todos.tsx tasks\
move Tasks.test.tsx tasks\

:: Move team files
move Team.tsx team\
move TeamManagement.tsx team\
move TeamHierarchy.tsx team\

:: Move settings files
move Settings.tsx settings\

:: Move reports files
move Reports.tsx reports\

:: Move documents files
move UploadDocument.tsx documents\
move Brochures.tsx documents\

:: Move auth files
move Login.tsx auth\
move SignUp.tsx auth\
move UnauthorizedPage.tsx auth\

:: Move dashboard files
move Dashboard.tsx dashboard\ 