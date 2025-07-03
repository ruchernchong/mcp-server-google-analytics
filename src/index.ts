import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from "@modelcontextprotocol/sdk/types.js";
import { BetaAnalyticsDataClient } from "@google-analytics/data";

// Validate environment variables
function validateEnvironment(): void {
  const requiredEnvVars = [
    "GOOGLE_CLIENT_EMAIL",
    "GOOGLE_PRIVATE_KEY",
    "GA_PROPERTY_ID",
  ];

  const missingVars = requiredEnvVars.filter(
    (varName) => !process.env[varName],
  );

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(", ")}`,
    );
  }
}

// Validate date format (YYYY-MM-DD)
function validateDateFormat(date: string): boolean {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date)) {
    return false;
  }

  const parsedDate = new Date(date);
  return parsedDate.toISOString().split("T")[0] === date;
}

// Validate date range
function validateDateRange(startDate: string, endDate: string): void {
  if (!validateDateFormat(startDate)) {
    throw new McpError(
      ErrorCode.InvalidParams,
      `Invalid startDate format. Expected YYYY-MM-DD, got: ${startDate}`,
    );
  }

  if (!validateDateFormat(endDate)) {
    throw new McpError(
      ErrorCode.InvalidParams,
      `Invalid endDate format. Expected YYYY-MM-DD, got: ${endDate}`,
    );
  }

  if (new Date(startDate) > new Date(endDate)) {
    throw new McpError(
      ErrorCode.InvalidParams,
      "startDate cannot be after endDate",
    );
  }
}

// Initialize environment validation
validateEnvironment();

// Initialize the Google Analytics Data client
const analyticsDataClient = new BetaAnalyticsDataClient({
  credentials: {
    client_email: process.env.GOOGLE_CLIENT_EMAIL!,
    private_key: process.env.GOOGLE_PRIVATE_KEY!.replace(/\\n/g, "\n"),
  },
});

const propertyId = process.env.GA_PROPERTY_ID!;

// Create the server
const server = new Server(
  {
    name: "google-analytics-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  },
);

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "getPageViews",
        description: "Get page view metrics for a specific date range",
        inputSchema: {
          type: "object",
          properties: {
            startDate: {
              type: "string",
              description: "Start date in YYYY-MM-DD format",
            },
            endDate: {
              type: "string",
              description: "End date in YYYY-MM-DD format",
            },
            dimensions: {
              type: "array",
              items: { type: "string" },
              description: "Dimensions to group by (e.g., page, country)",
            },
          },
          required: ["startDate", "endDate"],
        },
      },
      {
        name: "getActiveUsers",
        description: "Get active users metrics for a specific date range",
        inputSchema: {
          type: "object",
          properties: {
            startDate: {
              type: "string",
              description: "Start date in YYYY-MM-DD format",
            },
            endDate: {
              type: "string",
              description: "End date in YYYY-MM-DD format",
            },
          },
          required: ["startDate", "endDate"],
        },
      },
      {
        name: "getEvents",
        description: "Get event metrics for a specific date range",
        inputSchema: {
          type: "object",
          properties: {
            startDate: {
              type: "string",
              description: "Start date in YYYY-MM-DD format",
            },
            endDate: {
              type: "string",
              description: "End date in YYYY-MM-DD format",
            },
            eventName: {
              type: "string",
              description: "Specific event name to filter by (optional)",
            },
          },
          required: ["startDate", "endDate"],
        },
      },
      {
        name: "getUserBehavior",
        description:
          "Get user behavior metrics like session duration and bounce rate",
        inputSchema: {
          type: "object",
          properties: {
            startDate: {
              type: "string",
              description: "Start date in YYYY-MM-DD format",
            },
            endDate: {
              type: "string",
              description: "End date in YYYY-MM-DD format",
            },
          },
          required: ["startDate", "endDate"],
        },
      },
    ],
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case "getPageViews": {
        const {
          startDate,
          endDate,
          dimensions = ["page"],
        } = args as {
          startDate: string;
          endDate: string;
          dimensions?: string[];
        };

        validateDateRange(startDate, endDate);

        const [response] = await analyticsDataClient.runReport({
          property: `properties/${propertyId}`,
          dateRanges: [{ startDate, endDate }],
          dimensions: dimensions.map((dimension) => ({ name: dimension })),
          metrics: [{ name: "screenPageViews" }],
        });

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(response, null, 2),
            },
          ],
        };
      }

      case "getActiveUsers": {
        const { startDate, endDate } = args as {
          startDate: string;
          endDate: string;
        };

        validateDateRange(startDate, endDate);

        const [response] = await analyticsDataClient.runReport({
          property: `properties/${propertyId}`,
          dateRanges: [{ startDate, endDate }],
          metrics: [{ name: "activeUsers" }, { name: "newUsers" }],
          dimensions: [{ name: "date" }],
        });

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(response, null, 2),
            },
          ],
        };
      }

      case "getEvents": {
        const { startDate, endDate, eventName } = args as {
          startDate: string;
          endDate: string;
          eventName?: string;
        };

        validateDateRange(startDate, endDate);

        const [response] = await analyticsDataClient.runReport({
          property: `properties/${propertyId}`,
          dateRanges: [{ startDate, endDate }],
          dimensions: [{ name: "eventName" }, { name: "date" }],
          metrics: [{ name: "eventCount" }],
          ...(eventName && {
            dimensionFilter: {
              filter: {
                fieldName: "eventName",
                stringFilter: { value: eventName },
              },
            },
          }),
        });

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(response, null, 2),
            },
          ],
        };
      }

      case "getUserBehavior": {
        const { startDate, endDate } = args as {
          startDate: string;
          endDate: string;
        };

        validateDateRange(startDate, endDate);

        const [response] = await analyticsDataClient.runReport({
          property: `properties/${propertyId}`,
          dateRanges: [{ startDate, endDate }],
          metrics: [
            { name: "averageSessionDuration" },
            { name: "bounceRate" },
            { name: "sessionsPerUser" },
          ],
          dimensions: [{ name: "date" }],
        });

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(response, null, 2),
            },
          ],
        };
      }

      default:
        throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
    }
  } catch (error) {
    if (error instanceof McpError) {
      throw error;
    }

    // Handle Google Analytics API errors
    if (error instanceof Error) {
      throw new McpError(
        ErrorCode.InternalError,
        `Google Analytics API error: ${error.message}`,
      );
    }

    throw new McpError(ErrorCode.InternalError, "An unexpected error occurred");
  }
});

// Error handling for server startup
process.on("uncaughtException", (error) => {
  console.error("Uncaught exception:", error);
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled rejection at:", promise, "reason:", reason);
  process.exit(1);
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Google Analytics MCP server running on stdio");
}

main().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
