# GitHub Secrets Configuration Guide

This document outlines the GitHub secrets you need to configure for the CI/CD pipelines to work properly.

## Required GitHub Secrets

### API Secrets

#### Production Environment
- `AZURE_APP_NAME_API_PROD` - Azure App Service name for API production environment
- `AZURE_WEBAPP_PUBLISH_PROFILE_API_PROD` - Publish profile for API production deployment

### Frontend Secrets

#### Production Environment
- `AZURE_APP_NAME_FRONTEND_PROD` - Azure App Service name for frontend production environment
- `AZURE_WEBAPP_PUBLISH_PROFILE_FRONTEND_PROD` - Publish profile for frontend production deployment

## How to Configure GitHub Secrets

### Step 1: Access Repository Settings
1. Go to your GitHub repository
2. Click on "Settings" tab
3. In the left sidebar, click on "Secrets and variables"
4. Click on "Actions"

### Step 2: Add Secrets
1. Click "New repository secret"
2. Enter the secret name (e.g., `AZURE_APP_NAME_API_DEV`)
3. Enter the secret value
4. Click "Add secret"

### Step 3: Get Azure Publish Profiles

#### For API App Service:
1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to your API App Service (e.g., `your-api-prod`)
3. In the overview section, click "Get publish profile"
4. Download the `.PublishSettings` file
5. Open the file in a text editor
6. Copy the entire XML content
7. Paste it as the value for `AZURE_WEBAPP_PUBLISH_PROFILE_API_PROD` secret

#### For Frontend App Service:
1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to your Frontend App Service (e.g., `your-frontend-prod`)
3. In the overview section, click "Get publish profile"
4. Download the `.PublishSettings` file
5. Open the file in a text editor
6. Copy the entire XML content
7. Paste it as the value for `AZURE_WEBAPP_PUBLISH_PROFILE_FRONTEND_PROD` secret

## Workflow Triggers

### API Workflow (`api-ci.yml`)
- **Triggers on**: Changes to `PaymentsAPI/**` directory or the workflow file itself
- **Branches**: `main`
- **Actions**: Test, build, and deploy API to Azure App Service

### Frontend Workflow (`frontend-ci.yml`)
- **Triggers on**: Changes to `payments-frontend/**` directory or the workflow file itself
- **Branches**: `main`
- **Actions**: Test, build, and deploy frontend to Azure App Service

## Deployment Flow

### Production Deployment
- **Trigger**: Push to `main` branch
- **API**: Deploys to production API App Service
- **Frontend**: Deploys to production frontend App Service

## Environment Variables

### Frontend Environment Files
- `.env.production` - Used for production builds
- `.env.local` - Used for local development (not committed to git)

### Backend Configuration
- Update `appsettings.json` or `appsettings.Production.json` in Azure App Service configuration
- Set connection strings and other environment-specific settings in Azure App Service

## Troubleshooting

### Common Issues

1. **Deployment Fails**: Check that publish profiles are correctly copied (entire XML content)
2. **App Service Not Found**: Verify the app names match exactly in Azure and GitHub secrets
3. **Build Failures**: Check that all dependencies are properly configured
4. **Environment Variables**: Ensure frontend environment files are properly configured

### Verification Steps

1. **Check Workflow Runs**: Go to "Actions" tab in GitHub to see workflow execution
2. **Verify Deployments**: Check Azure App Service deployment logs
3. **Test Applications**: Verify both API and frontend are accessible after deployment

## Security Notes

- Never commit publish profiles or secrets to the repository
- Regularly rotate publish profiles for security
- Use different App Services for development and production
- Monitor deployment logs for any security issues
