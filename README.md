[![MseeP.ai Security Assessment Badge](https://mseep.net/pr/ruchernchong-mcp-server-google-analytics-badge.png)](https://mseep.ai/app/ruchernchong-mcp-server-google-analytics)

[![Verified on MseeP](https://mseep.ai/badge.svg)](https://mseep.ai/app/41973db2-3e96-4d8b-b138-265f40fd5bab)

# Google Analytics MCP Server

[![smithery badge](https://smithery.ai/badge/mcp-server-google-analytics)](https://smithery.ai/server/mcp-server-google-analytics)

An MCP server implementation for accessing Google Analytics 4 (GA4) data, built using the Model Context Protocol
TypeScript SDK.

## Features

- Get page view metrics with customizable dimensions
- Track active and new users over time
- Analyze specific events and their metrics
- Monitor user behavior metrics (session duration, bounce rate)
- Flexible date range selection for all queries

## Prerequisites

- Node.js 20 or higher
- A Google Analytics 4 property.
- A Google Cloud project with the **Analytics Data API** enabled.
- A service account with credentials to access the API.

## Setup and Configuration

To use this server, you need to configure authentication with Google Analytics. This is done using a service account.

### 1. Enable the Google Analytics Data API

1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Select the project you want to use.
3. In the navigation menu, go to **APIs & Services > Library**.
4. Search for **"Google Analytics Data API"** and enable it.

### 2. Create a Service Account

1. In the Google Cloud Console, navigate to **IAM & Admin > Service Accounts**.
2. Click **"Create Service Account"**.
3. Give the service account a name (e.g., "GA4 MCP Server").
4. Click **"Create and Continue"**.
5. You can skip granting the service account access to the project.
6. Click **"Done"**.
7. Find the service account you just created and click on the three dots under **"Actions"**.
8. Select **"Manage keys"**, then **"Add Key" > "Create new key"**.
9. Choose **JSON** as the key type and click **"Create"**. A JSON file with the credentials will be downloaded.

### 3. Grant Service Account Access to Google Analytics

1.  Open [Google Analytics](https://analytics.google.com/).
2.  Navigate to the **Admin** section of your GA4 property.
3.  Under the **Property** column, click on **Property Access Management**.
4.  Click the **"+"** button to add a new user.
5.  In the **"Email address"** field, paste the `client_email` from the JSON credentials file you downloaded.
6.  Assign the **"Viewer"** role. You do not need to notify the user.
7.  Click **"Add"**.

### 4. Set Environment Variables

The server requires the following environment variables:

- `GOOGLE_CLIENT_EMAIL`: The `client_email` from your service account JSON file.
- `GOOGLE_PRIVATE_KEY`: The `private_key` from your service account JSON file.
- `GA_PROPERTY_ID`: Your Google Analytics 4 property ID.

You can set them in your environment or use a `.env` file.

```bash
export GOOGLE_CLIENT_EMAIL="your-service-account@your-project.iam.gserviceaccount.com"
export GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY\n-----END PRIVATE KEY-----\n"
export GA_PROPERTY_ID="your_property_id"
```

## Installation

### Installing via Smithery

To install Google Analytics Server for Claude Desktop automatically via [Smithery](https://smithery.ai/server/mcp-server-google-analytics):

```bash
npx -y @smithery/cli install mcp-server-google-analytics --client claude
```

### Manual Installation
```bash
npm install -g mcp-server-google-analytics
```

Or use with npx directly:
```bash
npx mcp-server-google-analytics
```

## Usage

### Starting the Server

```bash
pnpm start
```

### Configuration in Claude Desktop

Add this to your Claude Desktop configuration:

```json
{
  "mcpServers": {
    "google-analytics": {
      "command": "npx",
      "args": ["-y", "mcp-server-google-analytics"],
      "env": {
        "GOOGLE_CLIENT_EMAIL": "your-service-account@project.iam.gserviceaccount.com",
        "GOOGLE_PRIVATE_KEY": "your-private-key",
        "GA_PROPERTY_ID": "your-ga4-property-id"
      }
    }
  }
}
```

## Available Functions

### runReport

Run a flexible report to get analytics data.

**Input:**

```json
{
  "startDate": "2024-01-01",
  "endDate": "2024-01-31",
  "dimensions": [{ "name": "country" }, { "name": "city" }],
  "metrics": [{ "name": "activeUsers" }, { "name": "newUsers" }],
  "dimensionFilter": {
    "filter": {
      "fieldName": "country",
      "stringFilter": {
        "value": "United States"
      }
    }
  }
}
```

### getPageViews

Get page view metrics for a specific date range:

```json
{
  "startDate": "2024-01-01",
  "endDate": "2024-01-31",
  "dimensions": ["page", "country"] // Optional
}
```

### getActiveUsers

Get active users metrics:

```json
{
  "startDate": "2024-01-01",
  "endDate": "2024-01-31"
}
```

### getEvents

Get event metrics:

```json
{
  "startDate": "2024-01-01",
  "endDate": "2024-01-31",
  "eventName": "purchase" // Optional
}
```

### getUserBehavior

Get user behavior metrics:

```json
{
  "startDate": "2024-01-01",
  "endDate": "2024-01-31"
}
```

## Security Considerations

- **Least Privilege**: Only grant the service account the "Viewer" role in Google Analytics.
- **Key Management**: Keep your service account key file secure and do not expose it in client-side code.
- **Environment Variables**: Use environment variables to store sensitive information like the client email, private key, and property ID.

## Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details on our code of conduct and
the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
