const fs = require('fs');
const path = require('path');

const directories = [
    'leads',
    'properties',
    'calls',
    'scheduler',
    'tasks',
    'team',
    'settings',
    'reports',
    'documents',
    'auth',
    'dashboard'
];

directories.forEach(dir => {
    const dirPath = path.join(__dirname, dir);
    if (fs.existsSync(dirPath)) {
        const files = fs.readdirSync(dirPath);
        files.forEach(file => {
            if (file.endsWith('.tsx') || file.endsWith('.ts')) {
                const filePath = path.join(dirPath, file);
                let content = fs.readFileSync(filePath, 'utf8');
                
                // Fix lib imports
                content = content.replace(
                    /from ['"]\.\.\/lib\/([^'"]+)['"]/g,
                    'from \'../../lib/$1\''
                );
                
                // Fix contexts imports
                content = content.replace(
                    /from ['"]\.\.\/contexts\/([^'"]+)['"]/g,
                    'from \'../../contexts/$1\''
                );
                
                // Fix components imports
                content = content.replace(
                    /from ['"]\.\.\/components\/([^'"]+)['"]/g,
                    'from \'../../components/$1\''
                );
                
                // Fix utils imports
                content = content.replace(
                    /from ['"]\.\.\/utils\/([^'"]+)['"]/g,
                    'from \'../../utils/$1\''
                );
                
                fs.writeFileSync(filePath, content);
                console.log(`Fixed imports in ${dir}/${file}`);
            }
        });
    }
}); 