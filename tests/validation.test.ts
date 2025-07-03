import { ErrorCode, McpError } from "@modelcontextprotocol/sdk/types.js";
import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";

// Mock the validation functions from the main module
function validateDateFormat(date: string): boolean {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date)) {
    return false;
  }

  const parsedDate = new Date(date);
  if (Number.isNaN(parsedDate.getTime())) {
    return false;
  }

  return parsedDate.toISOString().split("T")[0] === date;
}

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

describe("Date Validation", () => {
  describe("validateDateFormat", () => {
    it("should return true for valid date formats", () => {
      expect(validateDateFormat("2024-01-01")).toBe(true);
      expect(validateDateFormat("2023-12-31")).toBe(true);
      expect(validateDateFormat("2024-02-29")).toBe(true); // leap year
    });

    it("should return false for invalid date formats", () => {
      expect(validateDateFormat("24-01-01")).toBe(false);
      expect(validateDateFormat("2024-1-1")).toBe(false);
      expect(validateDateFormat("2024/01/01")).toBe(false);
      expect(validateDateFormat("2024-01-32")).toBe(false);
      expect(validateDateFormat("2024-13-01")).toBe(false);
      expect(validateDateFormat("not-a-date")).toBe(false);
    });
  });

  describe("validateDateRange", () => {
    it("should not throw for valid date ranges", () => {
      expect(() => validateDateRange("2024-01-01", "2024-01-31")).not.toThrow();
      expect(() => validateDateRange("2024-01-01", "2024-01-01")).not.toThrow();
    });

    it("should throw McpError for invalid start date", () => {
      expect(() => validateDateRange("invalid-date", "2024-01-31")).toThrow(
        McpError,
      );
    });

    it("should throw McpError for invalid end date", () => {
      expect(() => validateDateRange("2024-01-01", "invalid-date")).toThrow(
        McpError,
      );
    });

    it("should throw McpError when start date is after end date", () => {
      expect(() => validateDateRange("2024-01-31", "2024-01-01")).toThrow(
        McpError,
      );
    });
  });
});

describe("Environment Validation", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

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

  it("should not throw when all required environment variables are present", () => {
    process.env.GOOGLE_CLIENT_EMAIL = "test@example.com";
    process.env.GOOGLE_PRIVATE_KEY = "test-private-key";
    process.env.GA_PROPERTY_ID = "123456789";

    expect(() => validateEnvironment()).not.toThrow();
  });

  it("should throw when required environment variables are missing", () => {
    delete process.env.GOOGLE_CLIENT_EMAIL;
    delete process.env.GOOGLE_PRIVATE_KEY;
    delete process.env.GA_PROPERTY_ID;

    expect(() => validateEnvironment()).toThrow(
      "Missing required environment variables: GOOGLE_CLIENT_EMAIL, GOOGLE_PRIVATE_KEY, GA_PROPERTY_ID",
    );
  });

  it("should throw when only some environment variables are missing", () => {
    process.env.GOOGLE_CLIENT_EMAIL = "test@example.com";
    delete process.env.GOOGLE_PRIVATE_KEY;
    delete process.env.GA_PROPERTY_ID;

    expect(() => validateEnvironment()).toThrow(
      "Missing required environment variables: GOOGLE_PRIVATE_KEY, GA_PROPERTY_ID",
    );
  });
});
