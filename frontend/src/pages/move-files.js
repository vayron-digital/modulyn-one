const fs = require('fs');
const path = require('path');

const moves = {
    leads: [
        'Leads.tsx',
        'AddLead.tsx',
        'EditLead.tsx',
        'LeadDetails.tsx',
        'DumpedLeads.tsx',
        'LeadsList.tsx',
        'NewLead.tsx',
        'LeadForm.tsx',
        'LeadsPage.module.css'
    ],
    properties: [
        'Properties.tsx',
        'PropertyForm.tsx',
        'PropertyDetails.tsx'
    ],
    calls: [
        'Calls.tsx',
        'AddCall.tsx',
        'NewCall.tsx',
        'UploadCalls.tsx',
        'CallsList.tsx'
    ],
    scheduler: [
        'Scheduler.tsx',
        'Calendar.tsx'
    ],
    tasks: [
        'Tasks.tsx',
        'AddTask.tsx',
        'NewTask.tsx',
        'Todos.tsx',
        'Tasks.test.tsx'
    ],
    team: [
        'Team.tsx',
        'TeamManagement.tsx',
        'TeamHierarchy.tsx'
    ],
    settings: [
        'Settings.tsx'
    ],
    reports: [
        'Reports.tsx'
    ],
    documents: [
        'UploadDocument.tsx',
        'Brochures.tsx'
    ],
    auth: [
        'Login.tsx',
        'SignUp.tsx',
        'UnauthorizedPage.tsx'
    ],
    dashboard: [
        'Dashboard.tsx'
    ]
};

// Create directories if they don't exist
Object.keys(moves).forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

// Move files
Object.entries(moves).forEach(([dir, files]) => {
    files.forEach(file => {
        const sourcePath = path.join(__dirname, file);
        const destPath = path.join(__dirname, dir, file);
        
        try {
            if (fs.existsSync(sourcePath)) {
                // Read the file content
                const content = fs.readFileSync(sourcePath, 'utf8');
                // Write to new location
                fs.writeFileSync(destPath, content);
                // Delete the original file
                fs.unlinkSync(sourcePath);
                console.log(`Moved ${file} to ${dir}`);
            } else {
                console.log(`File ${file} not found`);
            }
        } catch (error) {
            console.error(`Error moving ${file}:`, error.message);
        }
    });
}); 