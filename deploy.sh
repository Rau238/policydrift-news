#!/bin/bash

# Vercel Deployment Script
# This script helps you deploy your news website to Vercel

echo "🚀 Vercel Deployment Helper"
echo "============================"
echo ""

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null
then
    echo "📦 Vercel CLI is not installed."
    echo "Would you like to install it? (y/n)"
    read -r response
    if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]
    then
        echo "Installing Vercel CLI..."
        npm install -g vercel
    else
        echo "❌ Vercel CLI is required. Exiting."
        exit 1
    fi
fi

echo ""
echo "✅ Vercel CLI is installed"
echo ""

# Check if user is logged in
echo "Checking Vercel authentication..."
if ! vercel whoami &> /dev/null
then
    echo "🔐 Please login to Vercel:"
    vercel login
else
    echo "✅ Already logged in to Vercel"
fi

echo ""
echo "📋 Deployment Options:"
echo "1. Deploy to Preview (test deployment)"
echo "2. Deploy to Production"
echo "3. Link to existing Vercel project"
echo ""
echo "Enter your choice (1-3):"
read -r choice

case $choice in
    1)
        echo ""
        echo "🚀 Deploying to Preview..."
        vercel
        ;;
    2)
        echo ""
        echo "⚠️  This will deploy to production!"
        echo "Make sure your environment variables are set in Vercel Dashboard."
        echo "Continue? (y/n)"
        read -r confirm
        if [[ "$confirm" =~ ^([yY][eE][sS]|[yY])$ ]]
        then
            echo "🚀 Deploying to Production..."
            vercel --prod
        else
            echo "❌ Deployment cancelled"
            exit 0
        fi
        ;;
    3)
        echo ""
        echo "🔗 Linking to existing project..."
        vercel link
        ;;
    *)
        echo "❌ Invalid choice. Exiting."
        exit 1
        ;;
esac

echo ""
echo "✨ Deployment complete!"
echo ""
echo "📝 Next steps:"
echo "1. Add environment variables in Vercel Dashboard"
echo "2. Update Supabase redirect URLs with your Vercel domain"
echo "3. Test your deployment"
echo ""
echo "📚 For more details, see DEPLOYMENT.md"
