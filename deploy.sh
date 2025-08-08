#!/bin/bash

echo "🚀 Deploying Modulyn CRM to Vercel..."

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "❌ Git repository not found. Please initialize git first:"
    echo "   git init"
    echo "   git remote add origin <your-github-repo-url>"
    exit 1
fi

# Check if all changes are committed
if [ -n "$(git status --porcelain)" ]; then
    echo "⚠️  You have uncommitted changes. Please commit them first:"
    echo "   git add ."
    echo "   git commit -m 'Prepare for deployment'"
    exit 1
fi

# Push to GitHub
echo "📤 Pushing to GitHub..."
git push origin main

echo "✅ Code pushed to GitHub!"
echo ""
echo "🎯 Next Steps:"
echo "1. Go to https://vercel.com"
echo "2. Sign up/Login with GitHub"
echo "3. Click 'New Project'"
echo "4. Import your repository"
echo "5. Configure environment variables:"
echo "   - SUPABASE_URL"
echo "   - SUPABASE_SERVICE_KEY"
echo "   - FASTSPRING_PRIVATE_KEY=f7a9803577c7f08fd04d5550ea0c51f5"
echo "   - FASTSPRING_STORE_ID=usercentraltechnologies_store"
echo "6. Deploy!"
echo ""
echo "📖 Full guide: docs/VERCEL_DEPLOYMENT_GUIDE.md"
