const swaggerDefinition = {
  openapi: "3.0.3",
  info: {
    title: "Inbound API",
    version: "1.0.0",
    description:
      "API documentation for the temporary disposable email service.\n\n" +
      "## API Response Format\n\n" +
      "All API endpoints follow a consistent response structure.\n\n" +
      "### Success Response\n\n" +
      "```json\n" +
      "{\n" +
      '  \"success\": true,\n' +
      '  \"message\": \"success message here\",\n' +
      '  \"data\": {}\n' +
      "}\n" +
      "```\n\n" +
      "### Error Response\n\n" +
      "```json\n" +
      "{\n" +
      '  \"success\": false,\n' +
      '  \"message\": \"the message goes here\",\n' +
      '  \"error\": {}\n' +
      "}\n" +
      "```\n\n" +
      "> **Production:** Never expose stack traces, internal errors, database details, or sensitive information to clients. Log detailed errors server-side and return only safe, meaningful error information."
  },
  servers: [
    {
      url: "http://localhost:9001",
      description: "Local development server"
    }
  ],
  tags: [
    {
      name: "System",
      description: "Service status endpoints"
    },
    {
      name: "Inbox",
      description: "Disposable inbox endpoints"
    }
  ],
  paths: {
    "/": {
      get: {
        tags: ["System"],
        summary: "Get service information",
        responses: {
          200: {
            description: "Service information",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/InitResponse"
                }
              }
            }
          }
        }
      }
    },
    "/api/v1/health": {
      get: {
        tags: ["System"],
        summary: "Check API health",
        responses: {
          200: {
            description: "API is healthy",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/HealthResponse"
                }
              }
            }
          }
        }
      }
    },
    "/api/v1/inbox": {
      post: {
        tags: ["Inbox"],
        summary: "Create a disposable inbox",
        description: "Creates a random email address and temporary inbox.",
        responses: {
          201: {
            description: "Disposable inbox created",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/CreateInboxResponse"
                }
              }
            }
          },
          500: {
            description: "Unable to create a disposable inbox",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse"
                }
              }
            }
          }
        }
      }
    },
    "/api/v1/inbox/info": {
      post: {
        tags: ["Inbox"],
        summary: "Fetch inbox information",
        description: "Fetches inbox metadata using the inbox id and access token.",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/InboxInfoRequest"
              }
            }
          }
        },
        responses: {
          200: {
            description: "Inbox information fetched",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/InboxInfoResponse"
                }
              }
            }
          },
          400: {
            description: "Invalid inbox id",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse"
                }
              }
            }
          },
          401: {
            description: "Missing or invalid authorization token",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse"
                }
              }
            }
          },
          404: {
            description: "Inbox not found",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse"
                }
              }
            }
          },
          410: {
            description: "Inbox has expired",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse"
                }
              }
            }
          },
          500: {
            description: "Unable to fetch inbox information",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse"
                }
              }
            }
          }
        }
      }
    }
  },
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "token"
      }
    },
    schemas: {
      SuccessResponse: {
        type: "object",
        required: ["success", "message", "data"],
        properties: {
          success: {
            type: "boolean",
            example: true
          },
          message: {
            type: "string",
            example: "Request completed successfully."
          },
          data: {
            type: "object",
            additionalProperties: true,
            example: {}
          }
        }
      },
      ErrorResponse: {
        type: "object",
        required: ["success", "message", "error"],
        properties: {
          success: {
            type: "boolean",
            example: false
          },
          message: {
            type: "string",
            example: "Unable to process the request."
          },
          error: {
            type: "object",
            additionalProperties: true,
            example: {}
          }
        }
      },
      InitResponse: {
        allOf: [
          {
            $ref: "#/components/schemas/SuccessResponse"
          },
          {
            type: "object",
            properties: {
              data: {
                type: "object",
                required: ["service", "version"],
                properties: {
                  service: {
                    type: "string",
                    example: "inbound-api"
                  },
                  version: {
                    type: "string",
                    example: "1.0.0"
                  }
                }
              }
            }
          }
        ]
      },
      HealthResponse: {
        allOf: [
          {
            $ref: "#/components/schemas/SuccessResponse"
          },
          {
            type: "object",
            properties: {
              message: {
                type: "string",
                example: "API is healthy."
              }
            }
          }
        ]
      },
      CreateInboxResponse: {
        allOf: [
          {
            $ref: "#/components/schemas/SuccessResponse"
          },
          {
            type: "object",
            properties: {
              data: {
                type: "object",
                required: ["id", "address", "token", "expiresAt"],
                properties: {
                  id: {
                    type: "string",
                    example: "clx1234567890"
                  },
                  address: {
                    type: "string",
                    format: "email",
                    example: "a7k2m9@inbound.test"
                  },
                  token: {
                    type: "string",
                    example: "temporary-access-token"
                  },
                  expiresAt: {
                    type: "string",
                    format: "date-time",
                    example: "2026-09-11T12:00:00.000Z"
                  }
                }
              }
            }
          }
        ]
      },
      InboxInfoRequest: {
        type: "object",
        required: ["id"],
        properties: {
          id: {
            type: "string",
            example: "clx1234567890"
          }
        }
      },
      InboxInfoResponse: {
        allOf: [
          {
            $ref: "#/components/schemas/SuccessResponse"
          },
          {
            type: "object",
            properties: {
              message: {
                type: "string",
                example: "Inbox Fetched Success"
              },
              data: {
                type: "object",
                required: ["address", "domain", "createdAt", "expiresAt"],
                properties: {
                  address: {
                    type: "string",
                    format: "email",
                    example: "a7k2m9@inbound.test"
                  },
                  domain: {
                    type: "string",
                    example: "inbound.test"
                  },
                  createdAt: {
                    type: "string",
                    format: "date-time",
                    example: "2026-09-11T10:00:00.000Z"
                  },
                  expiresAt: {
                    type: "string",
                    format: "date-time",
                    example: "2026-09-11T12:00:00.000Z"
                  }
                }
              }
            }
          }
        ]
      }
    }
  }
};

export default swaggerDefinition;
