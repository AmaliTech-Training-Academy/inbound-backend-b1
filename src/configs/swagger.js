const swaggerDefinition = {
  openapi: "3.0.3",
  info: {
    title: "Inbound API",
    version: "1.0.0",
    description: "API documentation for the temporary disposable email service."
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
    "/api/v1/inbox/gen-mail": {
      get: {
        tags: ["Inbox"],
        summary: "Generate a disposable email address",
        description: "Creates a random email address for a temporary inbox.",
        responses: {
          200: {
            description: "Disposable email address generated",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/GeneratedInboxResponse"
                }
              }
            }
          },
          500: {
            description: "Unable to generate a disposable email address"
          }
        }
      }
    },
    "/webhooks/inbound-email": {
      post: {
        tags: ["Inbox"],
        summary: "Ingest an inbound email",
        description: "Provider-facing JSON handoff for local development. Requires the webhook secret header.",
        parameters: [
          {
            name: "x-inbound-webhook-secret",
            in: "header",
            required: true,
            schema: {
              type: "string"
            }
          }
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/InboundMessageRequest"
              }
            }
          }
        },
        responses: {
          202: {
            description: "Message accepted and persisted"
          },
          200: {
            description: "Message rejected without provider retry"
          },
          401: {
            description: "Invalid webhook credentials"
          }
        }
      }
    }
  },
  components: {
    schemas: {
      HealthResponse: {
        type: "object",
        required: ["success", "message"],
        properties: {
          success: {
            type: "boolean",
            example: true
          },
          message: {
            type: "string",
            example: "API is healthy."
          }
        }
      },
      GeneratedInboxResponse: {
        type: "object",
        required: ["success", "generatedEmail"],
        properties: {
          success: {
            type: "boolean",
            example: true
          },
          generatedEmail: {
            type: "string",
            format: "email",
            example: "a7k2m9@inbound.test"
          }
        }
      },
      InboundMessageRequest: {
        type: "object",
        required: ["recipient", "fromAddress"],
        properties: {
          recipient: {
            type: "string",
            format: "email",
            example: "a7k2m9@inbound.test"
          },
          fromAddress: {
            type: "string",
            format: "email",
            example: "sender@example.com"
          },
          fromName: {
            type: "string",
            example: "Example Sender"
          },
          subject: {
            type: "string",
            example: "Your verification code"
          },
          textBody: {
            type: "string",
            example: "Your verification code is 123456."
          },
          htmlBody: {
            type: "string",
            example: "<p>Your verification code is <strong>123456</strong>.</p>"
          },
          sizeBytes: {
            type: "integer",
            minimum: 0,
            example: 128
          }
        }
      }
    }
  }
};

export default swaggerDefinition;
