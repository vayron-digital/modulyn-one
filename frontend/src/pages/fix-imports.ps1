$directories = @(
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
)

foreach ($dir in $directories) {
    $dirPath = Join-Path $PSScriptRoot $dir
    if (Test-Path $dirPath) {
        $files = Get-ChildItem -Path $dirPath -Filter "*.tsx"
        foreach ($file in $files) {
            $content = Get-Content $file.FullName -Raw
            
            # Fix lib imports
            $content = $content -replace "from ['`"]\.\.\/lib\/([^'`"]+)['`"]", "from '../../lib/`$1'"
            
            # Fix contexts imports
            $content = $content -replace "from ['`"]\.\.\/contexts\/([^'`"]+)['`"]", "from '../../contexts/`$1'"
            
            # Fix components imports
            $content = $content -replace "from ['`"]\.\.\/components\/([^'`"]+)['`"]", "from '../../components/`$1'"
            
            # Fix utils imports
            $content = $content -replace "from ['`"]\.\.\/utils\/([^'`"]+)['`"]", "from '../../utils/`$1'"
            
            Set-Content -Path $file.FullName -Value $content
            Write-Host "Fixed imports in $($dir)/$($file.Name)"
        }
    }
} 