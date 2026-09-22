const errorResponse = {
  description: "Request failed",
  content: {
    "application/json": {
      schema: {
        $ref: "#/components/schemas/ErrorResponse",
      },
    },
  },
};

const bearerErrors = {
  401: {
    description: "Missing or invalid bearer token",
    content: {
      "application/json": {
        schema: {
          $ref: "#/components/schemas/ErrorResponse",
        },
      },
    },
  },
  410: {
    description: "Inbox has expired",
    content: {
      "application/json": {
        schema: {
          $ref: "#/components/schemas/ErrorResponse",
        },
      },
    },
  },
};

const swaggerDefinition = {
  openapi: "3.0.3",
  info: {
    title: "Inbound Email API",
    version: "1.0.0",
    description:
      "OpenAPI documentation for the temporary inbound-email service. " +
      "The service creates short-lived inboxes, receives Mailgun webhooks, " +
      "parses MIME messages, sanitizes HTML, and stores messages in PostgreSQL.",
  },
  servers: [
    {
      url: "http://localhost:9001",
      description: "Local development server",
    },
  ],
  tags: [
    {
      name: "System",
      description: "Service metadata, health, and documentation endpoints.",
    },
    {
      name: "Inbox",
      description: "Temporary inbox creation and lifecycle operations.",
    },
    {
      name: "Messages",
      description: "Authenticated message retrieval and read state operations.",
    },
    {
      name: "Mailgun",
      description: "Inbound Mailgun webhook endpoints.",
    },
  ],
  paths: {
    "/": {
      get: {
        tags: ["System"],
        summary: "Get service information",
        operationId: "getServiceInformation",
        responses: {
          200: {
            description: "Service information",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/InitResponse",
                },
                example: {
                  success: true,
                  message: "The multiverse would never forgive me if I complied....",
                  data: {
                    service: "inbound-api",
                    version: "1.0.0",
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/v1/health": {
      get: {
        tags: ["System"],
        summary: "Check API health",
        operationId: "getHealth",
        description:
          "Confirms that the Express process is responding. This endpoint does not verify database or Mailgun readiness.",
        responses: {
          200: {
            description: "API is healthy",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/HealthResponse",
                },
                example: {
                  success: true,
                  message: "API is healthy.",
                },
              },
            },
          },
        },
      },
    },
    "/api/v1/inbox": {
      post: {
        tags: ["Inbox"],
        summary: "Create a temporary inbox",
        operationId: "createInbox",
        description:
          "Generates a random email address, creates an inbox, and returns a raw access token. The token is stored only as a SHA-256 hash and is returned only at creation time.",
        responses: {
          201: {
            description: "Inbox created",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/CreateInboxResponse",
                },
                example: {
                  success: true,
                  data: {
                    id: "8a5f1a9d-0c52-4d54-9f40-4b5a6d2e0d92",
                    address: "generated-address@example.com",
                    token: "raw-token-returned-once",
                    expiresAt: "2026-09-16T14:00:00.000Z",
                  },
                },
              },
            },
          },
          500: errorResponse,
        },
      },
    },
    "/api/v1/inbox/info": {
      get: {
        tags: ["Inbox"],
        summary: "Fetch authenticated inbox information",
        operationId: "getInboxInfo",
        description:
          "Returns metadata for the inbox represented by the bearer token. No inbox ID or query parameter is used by this route.",
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: "Inbox information",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/InboxInfoResponse",
                },
                example: {
                  success: true,
                  message: "Inbox Fetched Success",
                  data: {
                    address: "generated-address@example.com",
                    localPart: "generated-address",
                    extendCount: 0,
                    domain: "example.com",
                    createdAt: "2026-09-16T13:00:00.000Z",
                    expiresAt: "2026-09-16T14:00:00.000Z",
                    message: {},
                  },
                },
              },
            },
          },
          ...bearerErrors,
          404: {
            description: "Inbox not found or deleted",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
              },
            },
          },
          500: errorResponse,
        },
      },
    },
    "/api/v1/inbox/extend": {
      patch: {
        tags: ["Inbox"],
        summary: "Extend authenticated inbox expiration",
        operationId: "extendInbox",
        description:
          "Adds exactly five minutes to the current expiration time and increments extendCount. The current implementation does not enforce a maximum extension count.",
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: "Inbox expiration extended",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ExtendInboxResponse",
                },
                example: {
                  success: true,
                  message: "Inbox time extended successfully",
                  data: {
                    expiresAt: "2026-09-16T14:05:00.000Z",
                    lastExtendedAt: "2026-09-16T14:00:00.000Z",
                    extendCount: 1,
                  },
                },
              },
            },
          },
          ...bearerErrors,
          404: {
            description: "Inbox not found or deleted",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
              },
            },
          },
          500: errorResponse,
        },
      },
    },
    "/api/v1/inbox/messages/{id}": {
      get: {
        tags: ["Messages"],
        summary: "Fetch a message from the authenticated inbox",
        operationId: "getMessage",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            $ref: "#/components/parameters/MessageId",
          },
        ],
        responses: {
          200: {
            description: "Message details",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/MessageResponse",
                },
                example: {
                  success: true,
                  message: "Message Fetched Success",
                  data: {
                    id: "message-uuid",
                    subject: "Verification code",
                    sender: "Example Sender <sender@example.com>",
                    from: "sender@example.com",
                    to: "generated-address@example.com",
                    body: "<p>Sanitized message body</p>",
                    inboxId: "inbox-uuid",
                    attachments: [
                      {
                        id: "attachment-uuid",
                        filename: "document.pdf",
                        contentType: "application/pdf",
                        size: 48213,
                        url: "mailgun:token:document.pdf",
                        expiresAt: "2026-09-16T14:00:00.000Z",
                      },
                    ],
                    isRead: false,
                    status: "PARSED",
                    receivedAt: "2026-09-16T13:10:00.000Z",
                    expiresAt: "2026-09-16T14:00:00.000Z",
                    createdAt: "2026-09-16T13:10:00.000Z",
                  },
                },
              },
            },
          },
          ...bearerErrors,
          400: {
            description: "Missing message ID or token",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
              },
            },
          },
          404: {
            description: "Inbox or message not found",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
              },
            },
          },
          500: errorResponse,
        },
      },
    },
    "/api/v1/inbox/messages/{id}/read": {
      get: {
        tags: ["Messages"],
        summary: "Mark a message as read",
        operationId: "markMessageRead",
        description:
          "Marks the specified message as read. The current implementation exposes this state-changing operation as GET.",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            $ref: "#/components/parameters/MessageId",
          },
        ],
        responses: {
          200: {
            description: "Message marked as read",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/MessageReadResponse",
                },
                example: {
                  success: true,
                  message: "Message marked as read",
                },
              },
            },
          },
          ...bearerErrors,
          400: {
            description: "Missing message ID or token",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
              },
            },
          },
          500: errorResponse,
        },
      },
    },
    "/api/v1/webhooks/mailgun/raw-mime": {
      post: {
        tags: ["Mailgun"],
        summary: "Ingest a raw Mailgun MIME message",
        operationId: "ingestMailgunRawMime",
        description:
          "Accepts Mailgun multipart form data, verifies the webhook signature, validates the recipient inbox, parses the MIME message, sanitizes HTML, and persists a PARSED message using the IngestedMessageRecord shape. The service accepts either a body-mime file part or parsed body-plain/body-html fields. The response acknowledges persistence with the message ID; it does not return the complete Prisma record.",
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                $ref: "#/components/schemas/MailgunRawMimeRequest",
              },
            },
          },
        },
        responses: {
          202: {
            description: "Message accepted for ingestion",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/MailgunAcceptedResponse",
                },
                example: {
                  success: true,
                  duplicate: false,
                  messageId: "message-uuid",
                },
              },
            },
          },
          406: {
            description: "Payload, signature, recipient, inbox, or size validation failed",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
                examples: {
                  malformed: {
                    value: {
                      success: false,
                      message: "Malformed Mailgun payload.",
                    },
                  },
                  invalidSignature: {
                    value: {
                      success: false,
                      message: "Invalid Mailgun signature.",
                    },
                  },
                  unknownInbox: {
                    value: {
                      success: false,
                      message: "Inbox not found,unknown or expired",
                    },
                  },
                },
              },
            },
          },
          500: errorResponse,
        },
      },
    },
    "/api/v1/webhooks/mailgun/parsed": {
      post: {
        tags: ["Mailgun"],
        summary: "Validate a parsed Mailgun webhook",
        operationId: "acknowledgeParsedMailgunWebhook",
        description:
          "Validates the Mailgun signature, recipient, and presence of body-plain or body-html. This endpoint acknowledges the webhook but does not persist a message.",
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                $ref: "#/components/schemas/MailgunParsedRequest",
              },
            },
          },
        },
        responses: {
          200: {
            description: "Parsed webhook acknowledged",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/MailgunParsedResponse",
                },
                example: {
                  success: true,
                  message: "Mailgun dashboard webhook received.",
                },
              },
            },
          },
          406: {
            description: "Invalid parsed Mailgun webhook",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
                example: {
                  success: false,
                  message: "Invalid Mailgun dashboard webhook.",
                },
              },
            },
          },
        },
      },
    },
  },
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "token",
        description: "The raw token returned by POST /api/v1/inbox.",
      },
    },
    parameters: {
      MessageId: {
        name: "id",
        in: "path",
        required: true,
        description: "Message UUID.",
        schema: {
          type: "string",
          format: "uuid",
        },
        example: "message-uuid",
      },
    },
    schemas: {
      ErrorResponse: {
        type: "object",
        required: ["success", "message"],
        properties: {
          success: {
            type: "boolean",
            example: false,
          },
          message: {
            type: "string",
            example: "Unable to process the request.",
          },
        },
      },
      InitResponse: {
        type: "object",
        required: ["success", "message", "data"],
        properties: {
          success: {
            type: "boolean",
            example: true,
          },
          message: {
            type: "string",
          },
          data: {
            type: "object",
            required: ["service", "version"],
            properties: {
              service: {
                type: "string",
                example: "inbound-api",
              },
              version: {
                type: "string",
                example: "1.0.0",
              },
            },
          },
        },
      },
      HealthResponse: {
        type: "object",
        required: ["success", "message"],
        properties: {
          success: {
            type: "boolean",
            example: true,
          },
          message: {
            type: "string",
            example: "API is healthy.",
          },
        },
      },
      CreateInboxResponse: {
        type: "object",
        required: ["success", "data"],
        properties: {
          success: {
            type: "boolean",
            example: true,
          },
          data: {
            $ref: "#/components/schemas/CreatedInbox",
          },
        },
      },
      CreatedInbox: {
        type: "object",
        required: ["id", "address", "token", "expiresAt"],
        properties: {
          id: {
            type: "string",
            format: "uuid",
          },
          address: {
            type: "string",
            format: "email",
            example: "generated-address@example.com",
          },
          token: {
            type: "string",
            description: "Raw bearer token. Returned only when the inbox is created.",
            example: "raw-token-returned-once",
          },
          expiresAt: {
            type: "string",
            format: "date-time",
          },
        },
      },
      InboxInfoResponse: {
        type: "object",
        required: ["success", "message", "data"],
        properties: {
          success: {
            type: "boolean",
            example: true,
          },
          message: {
            type: "string",
            example: "Inbox Fetched Success",
          },
          data: {
            $ref: "#/components/schemas/InboxInfo",
          },
        },
      },
      InboxInfo: {
        type: "object",
        required: ["address", "localPart", "extendCount", "domain", "createdAt", "expiresAt", "message"],
        properties: {
          address: {
            type: "string",
            format: "email",
          },
          localPart: {
            type: "string",
          },
          extendCount: {
            type: "integer",
            minimum: 0,
          },
          domain: {
            type: "string",
          },
          createdAt: {
            type: "string",
            format: "date-time",
          },
          expiresAt: {
            type: "string",
            format: "date-time",
          },
          message: {
            type: "object",
            description: "The current controller returns an empty object because the loaded message array has no count property.",
            additionalProperties: false,
          },
        },
      },
      ExtendInboxResponse: {
        type: "object",
        required: ["success", "message", "data"],
        properties: {
          success: {
            type: "boolean",
            example: true,
          },
          message: {
            type: "string",
            example: "Inbox time extended successfully",
          },
          data: {
            type: "object",
            required: ["expiresAt", "lastExtendedAt", "extendCount"],
            properties: {
              expiresAt: {
                type: "string",
                format: "date-time",
              },
              lastExtendedAt: {
                type: "string",
                format: "date-time",
              },
              extendCount: {
                type: "integer",
                minimum: 1,
              },
            },
          },
        },
      },
      MessageResponse: {
        type: "object",
        required: ["success", "message", "data"],
        properties: {
          success: {
            type: "boolean",
            example: true,
          },
          message: {
            type: "string",
            example: "Message Fetched Success",
          },
          data: {
            $ref: "#/components/schemas/Message",
          },
        },
      },
      Message: {
        type: "object",
        description: "Message response model derived from the Prisma Message model. The GET endpoint returns the public aliases and projections (from, to, body, sender, and attachment size/url); persistence-only fields are documented as nullable or optional because the current controller does not expose them.",
        required: ["id", "subject", "sender", "from", "to", "body", "inboxId", "attachments", "isRead", "status", "receivedAt", "expiresAt", "createdAt"],
        properties: {
          id: {
            type: "string",
            format: "uuid",
          },
          subject: {
            type: "string",
            nullable: true,
          },
          sender: {
            type: "string",
            description: "Public projection of the persisted fromName and fromAddress values.",
          },
          fromAddress: {
            type: "string",
            format: "email",
            description: "Persisted sender address. Not returned by the current GET projection; use from in the response payload.",
          },
          fromName: {
            type: "string",
            nullable: true,
            description: "Persisted sender display name. Not returned as a standalone field; it contributes to sender.",
          },
          from: {
            type: "string",
            format: "email",
          },
          to: {
            type: "string",
            format: "email",
          },
          toAddress: {
            type: "string",
            format: "email",
            description: "Persisted recipient address. The public response exposes the same value as to.",
          },
          body: {
            type: "string",
            description: "Sanitized HTML when available; otherwise plain text.",
          },
          textBody: {
            type: "string",
            nullable: true,
            description: "Persisted plain-text body. The public response combines body selection into body.",
          },
          htmlBody: {
            type: "string",
            nullable: true,
            description: "Persisted sanitized HTML body. The public response exposes the selected body as body.",
          },
          inboxId: {
            type: "string",
            format: "uuid",
          },
          attachments: {
            type: "array",
            items: {
              $ref: "#/components/schemas/Attachment",
            },
          },
          isRead: {
            type: "boolean",
          },
          status: {
            type: "string",
            enum: ["PENDING", "PARSED", "FAILED"],
          },
          receivedAt: {
            type: "string",
            format: "date-time",
          },
          expiresAt: {
            type: "string",
            format: "date-time",
          },
          rawObjectKey: {
            type: "string",
            nullable: true,
            description: "Persisted raw-message object key. Not returned by the current GET endpoint.",
          },
          rawSizeBytes: {
            type: "integer",
            minimum: 0,
            nullable: true,
            description: "Persisted raw-message size in bytes. Not returned by the current GET endpoint.",
          },
          rawHtmlSize: {
            type: "number",
            format: "double",
            nullable: true,
            description: "Persisted raw HTML size. Not returned by the current GET endpoint.",
          },
          sizeBytes: {
            type: "integer",
            minimum: 0,
            description: "Persisted message size in bytes. Not returned by the current GET endpoint.",
          },
          parsedAt: {
            type: "string",
            format: "date-time",
            nullable: true,
            description: "Timestamp when parsing completed. Not returned by the current GET endpoint.",
          },
          errorMessage: {
            type: "string",
            nullable: true,
            description: "Persisted ingestion failure detail, when present. Not returned by the current GET endpoint.",
          },
          createdAt: {
            type: "string",
            format: "date-time",
            description: "Timestamp when the message record was created.",
          },
        },
      },
      Attachment: {
        type: "object",
        description: "Public attachment projection returned inside a message. Prisma sizeBytes is exposed as size and Prisma objectKey is exposed as url; attachment checksum and bytes are not returned by the current message endpoint.",
        required: ["id", "filename", "contentType", "size", "url", "expiresAt"],
        properties: {
          id: {
            type: "string",
            format: "uuid",
          },
          filename: {
            type: "string",
          },
          contentType: {
            type: "string",
          },
          size: {
            type: "integer",
            minimum: 0,
          },
          url: {
            type: "string",
            description: "The stored object key returned by the current message API. It is not a filesystem path or a downloadable HTTP URL.",
          },
          expiresAt: {
            type: "string",
            format: "date-time",
          },
        },
      },
      MessageReadResponse: {
        type: "object",
        required: ["success", "message"],
        properties: {
          success: {
            type: "boolean",
            example: true,
          },
          message: {
            type: "string",
            example: "Message marked as read",
          },
        },
      },
      IngestedMessageRecord: {
        type: "object",
        description: "Persistence shape supplied by mailIngestionService when creating a Prisma Message. This is an internal ingestion record, not the public GET message projection.",
        required: [
          "inboxId",
          "fromAddress",
          "fromName",
          "toAddress",
          "subject",
          "textBody",
          "htmlBody",
          "status",
          "expiresAt",
          "sizeBytes",
          "rawHtmlSize",
          "attachments",
        ],
        properties: {
          inboxId: {
            type: "string",
            format: "uuid",
          },
          fromAddress: {
            type: "string",
            format: "email",
          },
          fromName: {
            type: "string",
            nullable: true,
          },
          toAddress: {
            type: "string",
            format: "email",
          },
          subject: {
            type: "string",
            nullable: true,
          },
          textBody: {
            type: "string",
            nullable: true,
          },
          htmlBody: {
            type: "string",
            nullable: true,
            description: "Sanitized HTML body produced by the ingestion parser.",
          },
          status: {
            type: "string",
            enum: ["PENDING", "PARSED", "FAILED"],
            example: "PARSED",
          },
          expiresAt: {
            type: "string",
            format: "date-time",
          },
          sizeBytes: {
            type: "integer",
            minimum: 0,
            description: "Raw MIME byte length when body-mime is supplied; otherwise the UTF-8 byte length of textBody plus htmlBody.",
          },
          rawHtmlSize: {
            type: "number",
            format: "double",
            nullable: true,
          },
          attachments: {
            type: "array",
            items: {
              $ref: "#/components/schemas/IngestedAttachmentRecord",
            },
          },
        },
      },
      IngestedAttachmentRecord: {
        type: "object",
        description: "Attachment data supplied to the nested Prisma create operation during ingestion.",
        required: [
          "filename",
          "contentType",
          "sizeBytes",
          "checksum",
          "objectKey",
          "expiresAt",
        ],
        properties: {
          filename: {
            type: "string",
          },
          contentType: {
            type: "string",
          },
          sizeBytes: {
            type: "integer",
            minimum: 0,
          },
          checksum: {
            type: "string",
            nullable: true,
          },
          objectKey: {
            type: "string",
            description: "Internal Mailgun-derived storage key in the current implementation.",
          },
          expiresAt: {
            type: "string",
            format: "date-time",
          },
        },
      },
      MailgunRawMimeRequest: {
        type: "object",
        required: ["timestamp", "token", "signature", "recipient"],
        oneOf: [
          {
            required: ["body-mime"],
          },
          {
            required: ["body-plain"],
          },
          {
            required: ["body-html"],
          },
        ],
        properties: {
          timestamp: {
            type: "string",
            pattern: "^[0-9]+$",
            example: "1726491600",
          },
          token: {
            type: "string",
            example: "mailgun-webhook-token",
          },
          signature: {
            type: "string",
            pattern: "^[a-fA-F0-9]{64}$",
            example: "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
          },
          recipient: {
            type: "string",
            format: "email",
            example: "generated-address@example.com",
          },
          sender: {
            type: "string",
            format: "email",
          },
          from: {
            type: "string",
            example: "Example Sender <sender@example.com>",
          },
          subject: {
            type: "string",
          },
          "body-mime": {
            type: "string",
            format: "binary",
            description: "Raw MIME message file part.",
          },
          "body-plain": {
            type: "string",
            description: "Parsed plain-text body accepted when body-mime is not supplied.",
          },
          "body-html": {
            type: "string",
            description: "Parsed HTML body accepted when body-mime is not supplied.",
          },
        },
      },
      MailgunParsedRequest: {
        type: "object",
        required: ["timestamp", "token", "signature", "recipient"],
        oneOf: [
          {
            required: ["body-plain"],
          },
          {
            required: ["body-html"],
          },
        ],
        properties: {
          timestamp: {
            type: "string",
            pattern: "^[0-9]+$",
          },
          token: {
            type: "string",
          },
          signature: {
            type: "string",
            pattern: "^[a-fA-F0-9]{64}$",
          },
          recipient: {
            type: "string",
            format: "email",
          },
          "body-plain": {
            type: "string",
          },
          "body-html": {
            type: "string",
          },
        },
      },
      MailgunAcceptedResponse: {
        type: "object",
        required: ["success", "duplicate", "messageId"],
        properties: {
          success: {
            type: "boolean",
            example: true,
          },
          duplicate: {
            type: "boolean",
            example: false,
          },
          messageId: {
            type: "string",
            format: "uuid",
          },
        },
      },
      MailgunParsedResponse: {
        type: "object",
        required: ["success", "message"],
        properties: {
          success: {
            type: "boolean",
            example: true,
          },
          message: {
            type: "string",
            example: "Mailgun dashboard webhook received.",
          },
        },
      },
    },
  },
  "x-socketio": {
    description: "Socket.IO runs on the same server origin. It is not represented as an HTTP REST path.",
    connection: "http://localhost:9001",
    corsOriginEnvironmentVariable: "CLIENT_ORIGIN",
    events: {
      "join-inbox": {
        direction: "client-to-server",
        payload: {
          address: "generated-address@example.com",
          token: "raw-token",
        },
        acknowledgement: {
          success: true,
          room: "inbox:inbox-uuid",
        },
      },
      "message:new": {
        direction: "server-to-client",
        payload: {
          id: "message-uuid",
          fromAddress: "sender@example.com",
          subject: "Verification code",
          receivedAt: "2026-09-16T13:10:00.000Z",
        },
        note: "The current Mailgun ingestion path does not call publishNewMessage automatically.",
      },
    },
  },
};

export default swaggerDefinition;
