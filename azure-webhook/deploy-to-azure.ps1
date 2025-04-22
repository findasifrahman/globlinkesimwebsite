# Login to Azure
Write-Host "Logging in to Azure..."
az login

# Create a resource group if it doesn't exist
$resourceGroup = "esim-webhook-rg"
$location = "eastus"

Write-Host "Creating resource group $resourceGroup in $location..."
az group create --name $resourceGroup --location $location

# Create a storage account
$storageAccount = "esimwebhookstorage$(Get-Random -Minimum 1000 -Maximum 9999)"
Write-Host "Creating storage account $storageAccount..."
az storage account create --name $storageAccount --location $location --resource-group $resourceGroup --sku Standard_LRS

# Create a function app
$functionApp = "esim-webhook-func$(Get-Random -Minimum 1000 -Maximum 9999)"
Write-Host "Creating function app $functionApp..."
az functionapp create --name $functionApp --storage-account $storageAccount --resource-group $resourceGroup --consumption-plan-location $location --runtime node --runtime-version 16 --functions-version 4

# Deploy the function
Write-Host "Deploying function to $functionApp..."
func azure functionapp publish $functionApp

# Get the function URL
Write-Host "Getting function URL..."
$functionUrl = az functionapp function show --name $functionApp --resource-group $resourceGroup --function-name redteamobile-webhook --query "invokeUrl" -o tsv

Write-Host "Deployment complete!"
Write-Host "Function URL: $functionUrl"
Write-Host "Use this URL as your webhook URL in the Redtea Mobile dashboard." 