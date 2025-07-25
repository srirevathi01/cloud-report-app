# Cloud Dashboard

A modern React-based cloud management dashboard with Microsoft SSO authentication, featuring account management, resource monitoring, and API integration for cloud services.

## Features

- **Microsoft SSO Authentication**: Secure login using Microsoft Azure Active Directory
- **Material Design Theme**: Clean, modern UI with the custom #348feb color scheme
- **Account Management**: Dropdown selection for multiple 12-digit account numbers
- **Responsive Sidebar**: Conditional menu system with expandable sections
- **API Integration**: Built-in support for cloud resource management APIs
- **Region Management**: Comprehensive tools for listing regions, resources, and region-specific data

## Prerequisites

Before setting up the application, ensure you have the following:

- Node.js (version 18 or higher)
- pnpm package manager
- Microsoft Azure Active Directory tenant
- Azure App Registration for SSO

## Installation

1. Clone or download the project files
2. Navigate to the project directory:
   ```bash
   cd cloud-dashboard
   ```

3. Install dependencies:
   ```bash
   pnpm install
   ```

## Microsoft SSO Configuration

### Step 1: Create Azure App Registration

1. Go to the [Azure Portal](https://portal.azure.com/)
2. Navigate to **Azure Active Directory** > **App registrations**
3. Click **New registration**
4. Fill in the application details:
   - **Name**: Cloud Dashboard
   - **Supported account types**: Accounts in this organizational directory only
   - **Redirect URI**: Web - `http://localhost:5173`

5. Click **Register**

### Step 2: Configure Authentication

1. In your app registration, go to **Authentication**
2. Under **Platform configurations**, click **Add a platform**
3. Select **Single-page application**
4. Add the following redirect URIs:
   - `http://localhost:5173`
   - `http://localhost:5173/`

5. Under **Implicit grant and hybrid flows**, enable:
   - Access tokens
   - ID tokens

6. Click **Save**

### Step 3: API Permissions

1. Go to **API permissions**
2. Click **Add a permission**
3. Select **Microsoft Graph**
4. Choose **Delegated permissions**
5. Add the following permissions:
   - `User.Read`

6. Click **Grant admin consent** (if you have admin privileges)

### Step 4: Update Configuration File

1. Open `src/authConfig.js`
2. Replace the placeholder values with your actual Azure configuration:

```javascript
export const msalConfig = {
    auth: {
        clientId: "YOUR_CLIENT_ID_HERE", // Application (client) ID from Azure
        authority: "https://login.microsoftonline.com/YOUR_TENANT_ID_HERE", // Directory (tenant) ID
        redirectUri: "http://localhost:5173", // Must match the redirect URI in Azure
        postLogoutRedirectUri: "http://localhost:5173"
    },
    // ... rest of the configuration
};
```

**Where to find these values:**
- **Client ID**: In your app registration overview page, copy the "Application (client) ID"
- **Tenant ID**: In your app registration overview page, copy the "Directory (tenant) ID"

## API Server Configuration

The application expects a local API server running on `http://localhost:3000` with the following endpoints:

### Required Endpoints

1. **List Regions**: `GET /api/{account_id}/regions`
2. **List Resources**: `GET /api/{account_id}/resources`  
3. **List Resources by Region**: `GET /api/{account_id}/{region}`

### Example API Server Setup

Create a simple Express.js server or use your existing API server with these endpoints:

```javascript
// Example Express.js server
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// List regions endpoint
app.get('/api/:accountId/regions', (req, res) => {
    const { accountId } = req.params;
    res.json({
        account: accountId,
        regions: ['us-east-1', 'us-west-2', 'eu-west-1']
    });
});

// List resources endpoint
app.get('/api/:accountId/resources', (req, res) => {
    const { accountId } = req.params;
    res.json({
        account: accountId,
        resources: ['EC2', 'S3', 'RDS', 'Lambda']
    });
});

// List resources by region endpoint
app.get('/api/:accountId/:region', (req, res) => {
    const { accountId, region } = req.params;
    res.json({
        account: accountId,
        region: region,
        resources: ['EC2 instances: 5', 'S3 buckets: 12', 'RDS instances: 2']
    });
});

app.listen(3000, () => {
    console.log('API server running on http://localhost:3000');
});
```

## Running the Application

### Development Mode

1. Start the development server:
   ```bash
   pnpm run dev --host
   ```

2. Open your browser and navigate to `http://localhost:5173`

3. The application will automatically reload when you make changes to the source files

### Production Build

1. Build the application:
   ```bash
   pnpm run build
   ```

2. Preview the production build:
   ```bash
   pnpm run preview
   ```

## Usage Guide

### Authentication Flow

1. When you first access the application, you'll see the login screen
2. Click "Sign In with Microsoft" to authenticate
3. You'll be redirected to Microsoft's login page
4. After successful authentication, you'll return to the dashboard

### Account Selection

1. After logging in, use the "Account" dropdown in the header
2. Select one of the available 12-digit account numbers
3. The sidebar menu will appear once an account is selected

### Navigation

1. **Regions Menu**: Click to expand and see available actions
   - **List Regions**: Fetch all available regions for the selected account
   - **List Resources**: Get all resources for the selected account
   - **List Resource by Region**: Select a specific region to get region-specific resources

2. **Other Menus**: Compute, Security Hub, Database, Networking, and Monitoring menus are placeholders for future functionality

### API Integration

1. Select an account from the dropdown
2. Navigate to the Regions menu in the sidebar
3. Use the action buttons to make API calls:
   - Click "List Regions" to fetch region data
   - Click "List Resources" to fetch resource data
   - Select a region from the dropdown and click "List Resource by Region" for region-specific data

4. API responses will be displayed in the main content area

## Customization

### Theme Colors

The application uses a custom Material Design theme with the primary color `#348feb`. To modify the theme:

1. Open `src/App.css`
2. Update the CSS custom properties in the `:root` and `.dark` selectors
3. The primary color is defined as `--primary: oklch(0.6 0.15 240);`

### Adding New Menu Items

1. Open `src/components/Sidebar.jsx`
2. Add new items to the `menuItems` array:

```javascript
{
  id: 'new-menu',
  label: 'New Menu',
  icon: YourIcon, // Import from lucide-react
  subItems: [
    { id: 'sub-item-1', label: 'Sub Item 1' },
    { id: 'sub-item-2', label: 'Sub Item 2' }
  ]
}
```

3. Update `src/components/MainContent.jsx` to handle the new menu actions

### Account Numbers

The application currently uses mock account numbers. To integrate with real data:

1. Open `src/components/Header.jsx`
2. Replace the `accounts` array with your actual account data
3. Consider fetching this data from your API server

## Troubleshooting

### Common Issues

1. **Authentication Errors**
   - Verify your Azure app registration configuration
   - Check that redirect URIs match exactly
   - Ensure the client ID and tenant ID are correct

2. **API Connection Issues**
   - Verify your API server is running on `http://localhost:3000`
   - Check CORS configuration on your API server
   - Ensure the API endpoints match the expected format

3. **Build Errors**
   - Clear node_modules and reinstall: `rm -rf node_modules && pnpm install`
   - Check for TypeScript errors if using TypeScript
   - Verify all imports are correct

### Development Tips

1. Use browser developer tools to debug authentication issues
2. Check the console for MSAL-related errors
3. Use network tab to monitor API calls
4. Enable MSAL logging by updating the logger configuration in `authConfig.js`

## Security Considerations

1. **Never commit sensitive credentials** to version control
2. Use environment variables for production deployments
3. Implement proper CORS policies on your API server
4. Consider implementing additional security headers
5. Regularly update dependencies to patch security vulnerabilities

## Contributing

1. Follow the existing code style and structure
2. Test all changes thoroughly
3. Update documentation when adding new features
4. Ensure all linting rules pass before committing

## License

This project is licensed under the MIT License.

## Support

For issues and questions:
1. Check the troubleshooting section above
2. Review the Azure AD documentation
3. Check the browser console for error messages
4. Verify API server configuration and endpoints

