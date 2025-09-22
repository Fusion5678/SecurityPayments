#!/bin/bash

# Azure Static Web App Setup for React Frontend
# Run this script to create and configure Azure Static Web App

# Variables
RESOURCE_GROUP="AZ-JHB-RSG-RCGPBR-ST10500143-TER"
STATIC_WEB_APP_NAME="st10500143-payments-portal"
LOCATION="southafricanorth"
GITHUB_REPO="https://github.com/Fusion5678/SecurityPayments"
BRANCH="master"

echo "🚀 Setting up Azure Static Web App for React..."

# Using existing resource group
echo "Using existing resource group: $RESOURCE_GROUP"

# Create Static Web App
echo "Creating Static Web App..."
az staticwebapp create \
    --name $STATIC_WEB_APP_NAME \
    --resource-group $RESOURCE_GROUP \
    --source $GITHUB_REPO \
    --branch $BRANCH \
    --app-location "payments-frontend" \
    --output-location "dist" \
    --login-with-github

# Get the Static Web App URL
echo "Getting Static Web App URL..."
STATIC_WEB_APP_URL=$(az staticwebapp show \
    --name $STATIC_WEB_APP_NAME \
    --resource-group $RESOURCE_GROUP \
    --query "defaultHostname" \
    --output tsv)

echo ""
echo "✅ Azure Static Web App created successfully!"
echo ""
echo "📋 Configuration Summary:"
echo "  Static Web App Name: $STATIC_WEB_APP_NAME"
echo "  URL: https://$STATIC_WEB_APP_URL"
echo "  Resource Group: $RESOURCE_GROUP"
echo "  Location: $LOCATION"
echo ""
echo "🔧 Next Steps:"
echo "1. Update your API CORS to allow: https://$STATIC_WEB_APP_URL"
echo "2. Update payments-frontend/.env.production:"
echo "   VITE_API_BASE_URL=https://st10500143-payments.azurewebsites.net/api"
echo "3. GitHub Actions workflow will be auto-created for CI/CD"
echo "4. Push to master branch to trigger deployment"
echo ""
echo "🎯 GitHub Actions will automatically:"
echo "  - Build your React app on push to master"
echo "  - Deploy to Azure Static Web App"
echo "  - Use environment variables from .env.production"
echo ""
echo "🔑 API Token added to GitHub Secrets automatically!"
echo "📦 Your React app will be available at: https://$STATIC_WEB_APP_URL"
