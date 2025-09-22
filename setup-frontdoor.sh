#!/bin/bash

# Variables
RESOURCE_GROUP="your-resource-group-name"  # ← Update this with your actual resource group
FRONTDOOR_NAME="st10500143-payments-frontdoor"
LOCATION="southafricanorth"
API_BACKEND="st10500143-payments.azurewebsites.net"
FRONTEND_BACKEND="test-frontend.azurestaticapps.net"  # Test URL - replace later

# Create Front Door profile
echo "Creating Front Door profile..."
az afd profile create \
    --profile-name $FRONTDOOR_NAME \
    --resource-group $RESOURCE_GROUP \
    --sku Standard_AzureFrontDoor

# Create endpoint (this gives you the .azurefd.net domain)
echo "Creating Front Door endpoint..."
az afd endpoint create \
    --endpoint-name "main" \
    --profile-name $FRONTDOOR_NAME \
    --resource-group $RESOURCE_GROUP \
    --enabled-state Enabled

# Create origin group for API
echo "Creating API origin group..."
az afd origin-group create \
    --origin-group-name "api-origins" \
    --profile-name $FRONTDOOR_NAME \
    --resource-group $RESOURCE_GROUP \
    --probe-request-type GET \
    --probe-protocol Https \
    --probe-interval-in-seconds 60 \
    --probe-path "/health" \
    --sample-size 4 \
    --successful-samples-required 3 \
    --additional-latency-in-milliseconds 50

# Create origin group for Frontend
echo "Creating Frontend origin group..."
az afd origin-group create \
    --origin-group-name "frontend-origins" \
    --profile-name $FRONTDOOR_NAME \
    --resource-group $RESOURCE_GROUP \
    --probe-request-type GET \
    --probe-protocol Https \
    --probe-interval-in-seconds 60 \
    --probe-path "/" \
    --sample-size 4 \
    --successful-samples-required 3 \
    --additional-latency-in-milliseconds 50

# Add API origin
echo "Adding API origin..."
az afd origin create \
    --origin-name "api-origin" \
    --origin-group-name "api-origins" \
    --profile-name $FRONTDOOR_NAME \
    --resource-group $RESOURCE_GROUP \
    --host-name $API_BACKEND \
    --origin-host-header $API_BACKEND \
    --http-port 80 \
    --https-port 443 \
    --priority 1 \
    --weight 1000 \
    --enabled-state Enabled

# Add Frontend origin
echo "Adding Frontend origin..."
az afd origin create \
    --origin-name "frontend-origin" \
    --origin-group-name "frontend-origins" \
    --profile-name $FRONTDOOR_NAME \
    --resource-group $RESOURCE_GROUP \
    --host-name $FRONTEND_BACKEND \
    --origin-host-header $FRONTEND_BACKEND \
    --http-port 80 \
    --https-port 443 \
    --priority 1 \
    --weight 1000 \
    --enabled-state Enabled

# Create route for API traffic (/api/*)
echo "Creating API route..."
az afd route create \
    --route-name "api-route" \
    --endpoint-name "main" \
    --profile-name $FRONTDOOR_NAME \
    --resource-group $RESOURCE_GROUP \
    --origin-group "api-origins" \
    --supported-protocols Https \
    --patterns-to-match "/api/*" \
    --forwarding-protocol HttpsOnly \
    --https-redirect Enabled \
    --enabled-state Enabled

# Create route for Frontend traffic (/*)
echo "Creating Frontend route..."
az afd route create \
    --route-name "frontend-route" \
    --endpoint-name "main" \
    --profile-name $FRONTDOOR_NAME \
    --resource-group $RESOURCE_GROUP \
    --origin-group "frontend-origins" \
    --supported-protocols Https \
    --patterns-to-match "/*" \
    --forwarding-protocol HttpsOnly \
    --https-redirect Enabled \
    --enabled-state Enabled

# Create WAF policy
echo "Creating WAF policy..."
az network front-door waf-policy create \
    --resource-group $RESOURCE_GROUP \
    --name "${FRONTDOOR_NAME//-/}waf" \
    --sku Standard_AzureFrontDoor \
    --mode Prevention

# Get the Front Door endpoint URL
echo "Getting Front Door URL..."
FRONTDOOR_URL=$(az afd endpoint show \
    --endpoint-name "main" \
    --profile-name $FRONTDOOR_NAME \
    --resource-group $RESOURCE_GROUP \
    --query "hostName" \
    --output tsv)

echo ""
echo "🎉 Front Door setup complete!"
echo ""
echo "📋 Configuration Summary:"
echo "  Front Door URL: https://$FRONTDOOR_URL"
echo "  API Route:      https://$FRONTDOOR_URL/api/*"
echo "  Frontend Route: https://$FRONTDOOR_URL/*"
echo ""
echo "🔧 Next Steps:"
echo "1. Update your API CORS to allow: https://$FRONTDOOR_URL"
echo "2. Update your frontend API base URL to: https://$FRONTDOOR_URL/api"
echo "3. Replace test frontend URL with your actual Static Web App URL"
echo ""
echo "✅ Same-site architecture achieved! Both API and frontend on same domain."
