# Create directories if they don't exist
$directories = @(
    "leads",
    "properties",
    "calls",
    "scheduler",
    "tasks",
    "team",
    "settings",
    "reports",
    "documents",
    "auth",
    "dashboard"
)

foreach ($dir in $directories) {
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir
    }
}

# Move files to their respective directories
$moves = @{
    "leads" = @(
        "Leads.tsx",
        "AddLead.tsx",
        "EditLead.tsx",
        "LeadDetails.tsx",
        "DumpedLeads.tsx",
        "LeadsList.tsx",
        "NewLead.tsx",
        "LeadForm.tsx",
        "LeadsPage.module.css"
    )
    "properties" = @(
        "Properties.tsx",
        "PropertyForm.tsx",
        "PropertyDetails.tsx"
    )
    "calls" = @(
        "Calls.tsx",
        "AddCall.tsx",
        "NewCall.tsx",
        "UploadCalls.tsx",
        "CallsList.tsx"
    )
    "scheduler" = @(
        "Scheduler.tsx",
        "Calendar.tsx"
    )
    "tasks" = @(
        "Tasks.tsx",
        "AddTask.tsx",
        "NewTask.tsx",
        "Todos.tsx",
        "Tasks.test.tsx"
    )
    "team" = @(
        "Team.tsx",
        "TeamManagement.tsx",
        "TeamHierarchy.tsx"
    )
    "settings" = @(
        "Settings.tsx"
    )
    "reports" = @(
        "Reports.tsx"
    )
    "documents" = @(
        "UploadDocument.tsx",
        "Brochures.tsx"
    )
    "auth" = @(
        "Login.tsx",
        "SignUp.tsx",
        "UnauthorizedPage.tsx"
    )
    "dashboard" = @(
        "Dashboard.tsx"
    )
}

foreach ($dir in $moves.Keys) {
    foreach ($file in $moves[$dir]) {
        if (Test-Path $file) {
            Move-Item -Path $file -Destination $dir -Force
            Write-Host "Moved $file to $dir"
        } else {
            Write-Host "File $file not found"
        }
    }
} 