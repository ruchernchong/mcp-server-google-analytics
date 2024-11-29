import { Server } from "@modelcontextprotocol/sdk/server/index";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio";
import { BetaAnalyticsDataClient } from "@google-analytics/data";

const server = new Server(
  {
    name: "example-server/google-analytics",
    version: "1.0.0",
  },
  {
    capabilities: {
      resources: {},
    },
  },
);

// Initialize the Google Analytics Data client
const analyticsDataClient = new BetaAnalyticsDataClient({
  credentials: {
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  },
});

const propertyId = process.env.GA_PROPERTY_ID;

// Define the server functions
const functions = {
  getPageViews: {
    description: "Get page view metrics for a specific date range",
    parameters: {
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
    async handler({ startDate, endDate, dimensions = ["page"] }) {
      const [response] = await analyticsDataClient.runReport({
        property: `properties/${propertyId}`,
        dateRanges: [{ startDate, endDate }],
        dimensions: dimensions.map((dimension) => ({ name: dimension })),
        metrics: [{ name: "screenPageViews" }],
      });

      return response;
    },
  },

  getActiveUsers: {
    description: "Get active users metrics for a specific date range",
    parameters: {
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
    async handler({ startDate, endDate }) {
      const [response] = await analyticsDataClient.runReport({
        property: `properties/${propertyId}`,
        dateRanges: [{ startDate, endDate }],
        metrics: [{ name: "activeUsers" }, { name: "newUsers" }],
        dimensions: [{ name: "date" }],
      });

      return response;
    },
  },

  getEvents: {
    description: "Get event metrics for a specific date range",
    parameters: {
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
    async handler({ startDate, endDate, eventName }) {
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

      return response;
    },
  },

  getUserBehavior: {
    description:
      "Get user behavior metrics like session duration and bounce rate",
    parameters: {
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
    async handler({ startDate, endDate }) {
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

      return response;
    },
  },
};

const transport = new StdioServerTransport();
server.connect(transport);
