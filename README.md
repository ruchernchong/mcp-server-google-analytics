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
- Google Analytics 4 property
- Google Cloud project with Analytics Data API enabled
- Service account credentials with appropriate permissions

## Setup

1. Create a Google Cloud project and enable the Analytics Data API
2. Create a service account and download the credentials JSON file
3. Grant the service account appropriate access to your GA4 property
4. Set up environment variables:

```bash
export GOOGLE_CLIENT_EMAIL="your-service-account@project.iam.gserviceaccount.com"
export GOOGLE_PRIVATE_KEY="your-private-key"
export GA_PROPERTY_ID="your-ga4-property-id"
```

## Installation

### Installing via Smithery

To install Google Analytics Server for Claude Desktop automatically via [Smithery](https://smithery.ai/server/mcp-server-google-analytics):

```bash
npx -y @smithery/cli install mcp-server-google-analytics --client claude
```

### Manual Installation
```bash
pnpm install mcp-server-google-analytics
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

- Always use environment variables for sensitive credentials
- Implement appropriate CORS settings
- Follow the principle of least privilege when setting up service account permissions
- Regularly rotate service account credentials
- Monitor API usage and implement rate limiting if needed

## Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details on our code of conduct and
the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
