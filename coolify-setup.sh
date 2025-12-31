#!/bin/bash

# WAHA MOD - Quick Start Script for Coolify
# This script helps you prepare for Coolify deployment

set -e

echo "🚀 WAHA MOD - Coolify Deployment Setup"
echo "======================================"
echo ""

# Check if docker-compose exists
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "⚠️  Warning: docker-compose not found. This is OK if deploying to Coolify."
    echo "   Coolify will handle Docker Compose."
    echo ""
fi

# Create .env from template if not exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "✅ .env file created!"
    echo ""
    echo "⚠️  IMPORTANT: Edit .env file and change these values:"
    echo "   - WAHA_API_KEY (security!)"
    echo "   - WAHA_DASHBOARD_PASSWORD (security!)"
    echo "   - WAHA_SWAGGER_PASSWORD (security!)"
    echo ""
    
    # Generate random API key suggestion
    RANDOM_KEY=$(openssl rand -hex 32 2>/dev/null || cat /dev/urandom | tr -dc 'a-zA-Z0-9' | fold -w 64 | head -n 1)
    echo "💡 Suggested API key (copy this): $RANDOM_KEY"
    echo ""
else
    echo "✅ .env file already exists"
    echo ""
fi

# Show deployment options
echo "📦 Deployment Options:"
echo ""
echo "Option 1: Deploy from GitHub (Recommended)"
echo "  1. Push this repo to GitHub"
echo "  2. In Coolify: New Resource → Docker Compose"
echo "  3. Select your GitHub repo"
echo "  4. Set docker-compose location: docker-compose.coolify.yml"
echo "  5. Add environment variables from .env file"
echo "  6. Deploy!"
echo ""
echo "Option 2: Deploy from Docker Hub"
echo "  1. In Coolify: New Resource → Docker Compose"
echo "  2. Paste contents of docker-compose.coolify.yml"
echo "  3. Add environment variables from .env file"
echo "  4. Deploy!"
echo ""

# Check if git remote is configured
if git remote get-url origin &> /dev/null; then
    REMOTE_URL=$(git remote get-url origin)
    echo "✅ Git remote configured: $REMOTE_URL"
    echo ""
    
    # Check if there are unpushed commits
    if git status | grep -q "Your branch is ahead"; then
        echo "⚠️  You have unpushed commits. Push them before deploying:"
        echo "   git push origin main"
        echo ""
    else
        echo "✅ All commits are pushed"
        echo ""
    fi
else
    echo "⚠️  No git remote configured. Set it up:"
    echo "   git remote add origin https://github.com/YOUR_USERNAME/wahamod.git"
    echo "   git push -u origin main"
    echo ""
fi

# Show next steps
echo "📖 Next Steps:"
echo ""
echo "1. Review and edit .env file:"
echo "   nano .env"
echo ""
echo "2. (If using GitHub) Push to repository:"
echo "   git add .env"
echo "   git commit -m 'Configure environment'"
echo "   git push origin main"
echo ""
echo "3. Deploy in Coolify:"
echo "   Follow instructions in DEPLOY_COOLIFY.md"
echo ""
echo "4. Access your WAHA MOD:"
echo "   Dashboard: https://your-domain.com/dashboard"
echo "   Swagger: https://your-domain.com/swagger"
echo "   API: https://your-domain.com/api"
echo ""
echo "📚 Full documentation: DEPLOY_COOLIFY.md"
echo ""
echo "🎉 Ready for Coolify deployment!"
