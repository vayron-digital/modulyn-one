const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Find all TypeScript files
const files = glob.sync('src/**/*.{ts,tsx}');

files.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  
  // Replace relative supabase imports with @ alias
  const updatedContent = content.replace(
    /import\s*{\s*supabase\s*}\s*from\s*['"]\.\.?\/lib\/supabase['"]/g,
    "import { supabase } from '@/lib/supabase'"
  );
  
  if (content !== updatedContent) {
    fs.writeFileSync(file, updatedContent);
    console.log(`Updated imports in ${file}`);
  }
}); 