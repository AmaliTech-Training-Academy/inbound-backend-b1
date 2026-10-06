const errorResponse = {
  description: "Request failed",
  content: {
    "application/json": {
      schema: {
        $ref: "#/components/schemas/ErrorResponse",
      },
      example: {
        success: false,
        message: "Internal Server Error",
      },
    },
  },
};

// Every authenticated route is guarded by requireSessionAccess, so a rejected
// request can only fail with one of these three shapes.
const bearerErrors = {
  401: {
    description: "Missing or invalid session bearer token",
    content: {
      "application/json": {
        schema: {
          $ref: "#/components/schemas/ErrorResponse",
        },
        examples: {
          missingToken: {
            value: {
              success: false,
              message: "Authorization token is required",
            },
          },
          invalidFormat: {
            value: {
              success: false,
              message: "Invalid authorization format",
            },
          },
          sessionNotFound: {
            value: {
              success: false,
              message: "Session Not Found",
            },
          },
        },
      },
    },
  },
  410: {
    description: "Session has expired",
    content: {
      "application/json": {
        schema: {
          $ref: "#/components/schemas/ErrorResponse",
        },
        example: {
          success: false,
          message: "Session Expired",
        },
      },
    },
  },
  429: {
    description: "Rate limit exceeded (100 requests per IP per 15 minutes)",
    content: {
      "application/json": {
        schema: {
          $ref: "#/components/schemas/ErrorResponse",
        },
        example: {
          status: 429,
          message: "Too many requests from this IP, please try again later.",
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
    description: `## Overview
OpenAPI documentation for the temporary inbound-email service. The service creates short-lived inboxes, receives Mailgun webhooks, parses MIME messages, sanitizes HTML, and stores messages in PostgreSQL.

---

## Authentication
\`POST /api/v1/inbox\` and \`POST /api/v1/inbox/custom\` create a session and return its raw token as \`data.session.token\`. Every other route except \`GET /\`, \`GET /api/v1/health\`, and the Mailgun webhooks requires that value as \`Authorization: Bearer <session token>\`. Tokens are stored as SHA-256 hashes and are returned only at creation time. Inbox-scoped routes additionally require the inbox to belong to the calling session.

All routes under \`/api/v1\` are rate limited to 100 requests per IP per 15 minutes.

---

## Real-Time WebSocket Interface (Socket.IO)
In addition to REST endpoints, the server provides a real-time event interface powered by **Socket.IO** mounted on the primary HTTP server origin (e.g. \`http://localhost:9001\`).

### 1. Connection
Clients connect to the server root via Socket.IO:
\`\`\`javascript
import { io } from "socket.io-client";

const socket = io("http://localhost:9001", {
  transports: ["websocket", "polling"]
});
\`\`\`
CORS origins can be customized via the \`CLIENT_ORIGIN\` environment variable (defaults to \`*\`).

### 2. Authenticated Room Subscription: \`join-inbox\`
Clients join an isolated room scoped to a specific inbox by providing the inbox address and the session token that owns it.

- **Event:** \`join-inbox\`
- **Direction:** Client to Server
- **Payload Schema:** [SocketJoinInboxPayload](#/components/schemas/SocketJoinInboxPayload)
\`\`\`json
{
  "address": "user-abc123@domain.com",
  "token": "raw-session-token"
}
\`\`\`
- **Acknowledgement Callback:**
  - **Success Response:** [SocketJoinInboxSuccessResponse](#/components/schemas/SocketJoinInboxSuccessResponse)
    \`\`\`json
    {
      "success": true,
      "room": "inbox:c56a4180-65aa-42ec-a945-5fd21dec0538"
    }
    \`\`\`
  - **Failure Response:** [SocketJoinInboxErrorResponse](#/components/schemas/SocketJoinInboxErrorResponse)
    \`\`\`json
    {
      "success": false,
      "error": "invalid or expired inbox credentials"
    }
    \`\`\`
  - **Possible Error Reasons:**
    - \`"address and token are required"\`: Missing or blank \`address\` or \`token\` fields.
    - \`"invalid or expired inbox credentials"\`: The address is unknown, the token does not match the owning session, or the inbox or its session has expired or been deleted.
    - \`"unable to validate inbox credentials"\`: Database or server error during validation.
  - **Multi-Inbox Subscription:** Clients can subscribe to multiple inboxes simultaneously on the same socket connection to receive live updates across all active session addresses.

### 3. Explicit Unsubscription: \`leave-inbox\`
Clients can unsubscribe from a specific inbox room without terminating the WebSocket connection.

- **Event:** \`leave-inbox\`
- **Direction:** Client to Server
- **Payload Schema:** [SocketLeaveInboxPayload](#/components/schemas/SocketLeaveInboxPayload)
\`\`\`json
{
  "inboxId": "c56a4180-65aa-42ec-a945-5fd21dec0538"
}
\`\`\`
- **Acknowledgement Callback:**
  - **Success Response:** [SocketLeaveInboxSuccessResponse](#/components/schemas/SocketLeaveInboxSuccessResponse)
    \`\`\`json
    {
      "success": true,
      "room": "inbox:c56a4180-65aa-42ec-a945-5fd21dec0538"
    }
    \`\`\`
  - **Failure Response:** [SocketLeaveInboxErrorResponse](#/components/schemas/SocketLeaveInboxErrorResponse)
    \`\`\`json
    {
      "success": false,
      "error": "inboxId is required"
    }
    \`\`\`

### 4. Real-Time Message Push: \`message:new\`
When a new message arrives for a subscribed inbox, the server broadcasts an event to that inbox's room.

- **Event:** \`message:new\`
- **Direction:** Server to Client
- **Target Room:** \`inbox:<inboxId>\`
- **Payload Schema:** [SocketMessageNewEvent](#/components/schemas/SocketMessageNewEvent)
\`\`\`json
{
  "id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "inboxId": "c56a4180-65aa-42ec-a945-5fd21dec0538",
  "toAddress": "user-abc123@domain.com",
  "fromAddress": "sender@example.com",
  "subject": "Verification code",
  "receivedAt": "2026-09-17T09:00:00.000Z"
}
\`\`\`
`,
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
      name: "Session",
      description: "Session metadata and inboxes associated with a session.",
    },
    {
      name: "Messages",
      description: "Authenticated message retrieval and read state operations.",
    },
    {
      name: "Mailgun",
      description: "Inbound Mailgun webhook endpoints.",
    },
    {
      name: "WebSocket",
      description: "Socket.IO real-time inbox events (join-inbox, message:new).",
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
          "Generates an inbox and, unless a valid session bearer token is supplied, a new parent session. The raw session token is returned once, under data.session.token; it is the only credential issued by this route and is stored as a SHA-256 hash. Pass it as the bearer token on every other route. When a valid, unexpired bearer token is sent, the existing session is reused and the caller's own token is echoed back in data.session.token. The inbox address is generated from a random local part; use POST /api/v1/inbox/custom to choose the local part.",
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
                    session: {
                      token: "raw-session-token-returned-once",
                      expiresAt: "2026-09-16T14:00:00.000Z",
                    },
                    id: "8a5f1a9d-0c52-4d54-9f40-4b5a6d2e0d92",
                    address: "generated-address@example.com",
                    expiresAt: "2026-09-16T14:00:00.000Z",
                  },
                },
              },
            },
          },
          404: {
            description:
              "A bearer token was supplied but no session matches it. Requesting an inbox without a bearer token never returns 404.",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
                example: {
                  success: false,
                  message: "Session Not Found",
                },
              },
            },
          },
          429: bearerErrors[429],
          500: errorResponse,
        },
      },
    },
    "/api/v1/inbox/custom": {
      post: {
        tags: ["Inbox"],
        summary: "Create a temporary inbox with a chosen local part",
        operationId: "createCustomInbox",
        description:
          "Behaves exactly like POST /api/v1/inbox, but the address local part is supplied by the caller instead of generated, so the address is <localPart>@<MAIL_DOMAIN>. The local part must match ^[a-zA-Z0-9]+$ and be at most 64 characters; it is not normalized, so an existing address that differs only by case still collides. Session handling is identical: a new session is created unless a valid bearer token is reused.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/CustomInboxRequest",
              },
              example: {
                localPart: "mycustominbox",
              },
            },
          },
        },
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
                    session: {
                      token: "raw-session-token-returned-once",
                      expiresAt: "2026-09-16T14:00:00.000Z",
                    },
                    id: "8a5f1a9d-0c52-4d54-9f40-4b5a6d2e0d92",
                    address: "mycustominbox@example.com",
                    expiresAt: "2026-09-16T14:00:00.000Z",
                  },
                },
              },
            },
          },
          400: {
            description: "Invalid or missing localPart",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
                example: {
                  success: false,
                  message:
                    "Invalid localPart. It must be a non-empty alphanumeric string of at most 64 characters.",
                },
              },
            },
          },
          404: {
            description: "A bearer token was supplied but no session matches it",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
                example: {
                  success: false,
                  message: "Session Not Found",
                },
              },
            },
          },
          409: {
            description: "The requested address is already taken",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
                example: {
                  success: false,
                  message: "Inbox with this localPart already exists.",
                },
              },
            },
          },
          429: bearerErrors[429],
          500: errorResponse,
        },
      },
    },
    "/api/v1/session": {
      get: {
        tags: ["Session"],
        summary: "Fetch authenticated session information",
        operationId: "getSessionInfo",
        description:
          "Returns expiration metadata for the bearer session and the number of inboxes it owns, including soft-deleted ones.",
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: "Session information",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/SessionInfoResponse",
                },
                example: {
                  success: true,
                  message: "Session Info Fetched Success",
                  data: {
                    createdAt: "2026-09-16T13:00:00.000Z",
                    expiresAt: "2026-09-16T14:00:00.000Z",
                    lastExtendedAt: null,
                    inboxCount: 1,
                  },
                },
              },
            },
          },
          ...bearerErrors,
          500: {
            description: "Request failed",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
                example: {
                  success: false,
                  message: "Internal server error",
                },
              },
            },
          },
        },
      },
    },
    "/api/v1/session/inboxes": {
      get: {
        tags: ["Session"],
        summary: "List inboxes for the authenticated session",
        operationId: "getSessionInboxes",
        description:
          "Returns the id, email address, and lifecycle metadata for each inbox owned by the bearer session, including each inbox's total message count. Soft-deleted inboxes are included; there is no filter parameter.",
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: "Session inboxes",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/SessionInboxesResponse",
                },
                example: {
                  success: true,
                  message: "Session Inboxes Fetched Success",
                  data: {
                    inboxes: [
                      {
                        id: "c56a4180-65aa-42ec-a945-5fd21dec0538",
                        address: "generated-address@example.com",
                        localPart: "generated-address",
                        domain: "example.com",
                        createdAt: "2026-09-16T13:00:00.000Z",
                        expiresAt: "2026-09-16T14:00:00.000Z",
                        messageCount: 3,
                      },
                    ],
                  },
                },
              },
            },
          },
          ...bearerErrors,
          500: {
            description: "Request failed",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
                example: {
                  success: false,
                  message: "Error fetching session inboxes",
                },
              },
            },
          },
        },
      },
    },
    "/api/v1/inbox/{id}": {
      get: {
        tags: ["Inbox"],
        summary: "Fetch a single inbox owned by the session",
        operationId: "getInboxInfo",
        description:
          "Returns metadata for one inbox, including its expiration state and message count. The inbox must belong to the bearer session; an inbox owned by another session is reported as not found rather than forbidden.",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            $ref: "#/components/parameters/InboxId",
          },
        ],
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
                    message: {
                      count: 3,
                    },
                  },
                },
              },
            },
          },
          ...bearerErrors,
          400: {
            description: "Missing inbox ID",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
                example: {
                  success: false,
                  message: "Inbox ID is required",
                },
              },
            },
          },
          404: {
            description: "Inbox not found, not owned by the session, or deleted",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
                examples: {
                  notFound: {
                    value: {
                      success: false,
                      message: "Inbox Not Found",
                    },
                  },
                  deleted: {
                    value: {
                      success: false,
                      message: "Inbox has been deleted",
                    },
                  },
                },
              },
            },
          },
          410: {
            description: "The inbox itself has expired",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
                example: {
                  success: false,
                  message: "Inbox has expired",
                },
              },
            },
          },
          500: {
            description: "Request failed",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
                example: {
                  success: false,
                  message: "An error occurred while get inbox.",
                },
              },
            },
          },
        },
      },
      delete: {
        tags: ["Inbox"],
        summary: "Permanently delete an inbox",
        operationId: "deleteInbox",
        description:
          "Immediately and permanently deletes the inbox along with every message and attachment it owns. The inbox must belong to the bearer session. Runs as a single transaction that removes attachments first, then messages, then the inbox, so nothing is left for a later cleanup pass. This is a hard delete: the records are gone as soon as the request succeeds and cannot be recovered, and the address becomes free for reuse. Repeating the request returns 404 because the inbox no longer exists. Expiration is not checked, so an expired inbox can still be deleted.",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            $ref: "#/components/parameters/InboxId",
          },
        ],
        responses: {
          200: {
            description: "Inbox and its messages and attachments deleted",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/DeleteInboxResponse",
                },
                example: {
                  success: true,
                  message: "Inbox deleted successfully",
                  data: {
                    id: "8a5f1a9d-0c52-4d54-9f40-4b5a6d2e0d92",
                    deletedMessages: 3,
                    deletedAttachments: 2,
                  },
                },
              },
            },
          },
          ...bearerErrors,
          400: {
            description: "Missing inbox ID",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
                example: {
                  success: false,
                  message: "Inbox ID is required",
                },
              },
            },
          },
          404: {
            description: "Inbox not found, not owned by the session, or already deleted",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
                example: {
                  success: false,
                  message: "Inbox Not Found",
                },
              },
            },
          },
          500: {
            description: "Deletion failed; the transaction was rolled back",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
                example: {
                  success: false,
                  message: "Unable to delete inbox",
                },
              },
            },
          },
        },
      },
    },
    "/api/v1/inbox/extend/{id}": {
      patch: {
        tags: ["Inbox"],
        summary: "Extend an inbox expiration",
        operationId: "extendInbox",
        description:
          "Adds exactly five minutes to the inbox expiration and increments extendCount. When the inbox has already expired, the five minutes are added to the current time instead of the stale expiration. The parent session expiration is pushed forward with the inbox, but is never shortened, and its lastExtendedAt is updated. The inbox must belong to the bearer session. The current implementation does not enforce a maximum extension count.",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            $ref: "#/components/parameters/InboxId",
          },
        ],
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
          400: {
            description: "Missing inbox ID",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
                example: {
                  success: false,
                  message: "Inbox ID is required",
                },
              },
            },
          },
          404: {
            description: "Inbox not found, not owned by the session, or deleted",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
                examples: {
                  notFound: {
                    value: {
                      success: false,
                      message: "Inbox Not Found",
                    },
                  },
                  deleted: {
                    value: {
                      success: false,
                      message: "Inbox has been deleted",
                    },
                  },
                },
              },
            },
          },
          500: {
            description: "Request failed",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
                example: {
                  success: false,
                  message: "Unable to extend inbox time",
                },
              },
            },
          },
        },
      },
    },
    "/api/v1/inbox/messages": {
      get: {
        tags: ["Messages"],
        summary: "Fetch all messages from the session's inbox",
        operationId: "getInboxMessages",
        description:
          "Returns messages belonging to an inbox owned by the bearer session, newest-first, each with its attachment count. The inbox must be active: not deleted and not expired. When the session owns more than one inbox, the target inbox is selected by the optional inboxId query parameter; otherwise the first active inbox for the session is used.\n\n**Known routing issue:** in the current Express router, GET /api/v1/inbox/:id is registered before the /messages sub-router, so this exact path is matched by getInboxInfo and responds 404 (Inbox Not Found). Use GET /api/v1/inbox/messages/unread/all, or reorder the routes in src/api/v1/routes/inboxRoute.js to reach this endpoint.",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "inboxId",
            in: "query",
            required: false,
            description:
              "Selects which of the session's inboxes to read from. Omit to use the first active inbox.",
            schema: {
              type: "string",
              format: "uuid",
            },
          },
        ],
        responses: {
          200: {
            description: "Inbox messages list",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/InboxMessagesResponse",
                },
                example: {
                  success: true,
                  message: "Inbox messages fetched successfully",
                  data: {
                    session: {
                      id: "c56a4180-65aa-42ec-a945-5fd21dec0538",
                      createdAt: "2026-09-16T13:00:00.000Z",
                      expiresAt: "2026-09-16T14:00:00.000Z",
                      lastExtendedAt: null,
                    },
                    messages: [
                      {
                        id: "message-uuid",
                        subject: "Verification code",
                        fromName: "Example Sender",
                        fromAddress: "sender@example.com",
                        toAddress: "generated-address@example.com",
                        isRead: false,
                        status: "PARSED",
                        receivedAt: "2026-09-16T13:10:00.000Z",
                        expiresAt: "2026-09-16T14:00:00.000Z",
                        attachmentCount: 1,
                      },
                      {
                        id: "message-uuid-2",
                        subject: "Password reset",
                        fromName: "Support",
                        fromAddress: "support@example.com",
                        toAddress: "generated-address@example.com",
                        isRead: true,
                        status: "PARSED",
                        receivedAt: "2026-09-16T12:45:00.000Z",
                        expiresAt: "2026-09-16T13:45:00.000Z",
                        attachmentCount: 0,
                      },
                    ],
                  },
                },
              },
            },
          },
          ...bearerErrors,
          404: {
            description:
              "No active inbox found for the session. An expired or deleted inbox is reported the same way, and no separate 410 is returned by this route.",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
                example: {
                  success: false,
                  message: "Inbox not found or has expired",
                },
              },
            },
          },
          500: {
            description: "Request failed",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
                example: {
                  success: false,
                  message: "Error fetching inbox messages",
                },
              },
            },
          },
        },
      },
    },
    "/api/v1/inbox/messages/{id}": {
      get: {
        tags: ["Messages"],
        summary: "Fetch a single message",
        operationId: "getMessage",
        description:
          "Returns one message with its sanitized body and attachment list. The message must belong to an active inbox owned by the bearer session; an expired or deleted inbox is reported as Message Not Found. The body field carries the sanitized HTML when the message has one, and the plain-text body otherwise. The response is a public projection: it omits the message id and several persisted fields (raw MIME key and size, parsedAt, errorMessage, textBody/htmlBody as separate fields).",
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
                    subject: "Verification code",
                    sender: "Example Sender <sender@example.com>",
                    from: "sender@example.com",
                    to: "generated-address@example.com",
                    body: "<p>Your verification code is <strong>123456</strong>.</p>",
                    inboxId: "c56a4180-65aa-42ec-a945-5fd21dec0538",
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
            description: "Missing message ID",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
                example: {
                  success: false,
                  message: "Missing Message Id",
                },
              },
            },
          },
          404: {
            description:
              "Message not found, not owned by the session, or belonging to an inbox that is expired or deleted",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
                example: {
                  success: false,
                  message: "Message Not Found",
                },
              },
            },
          },
          500: {
            description: "Request failed",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
                example: {
                  success: false,
                  message: "Error fetching message",
                },
              },
            },
          },
        },
      },
    },
    "/api/v1/inbox/messages/{id}/read": {
      get: {
        tags: ["Messages"],
        summary: "Mark a message as read",
        operationId: "markMessageRead",
        description:
          "Marks the specified message as read. The message must belong to an active inbox owned by the bearer session. The current implementation exposes this state-changing operation as GET, so it is not safe to pre-fetch or cache. The response echoes the session record.",
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
                  data: {
                    session: {
                      id: "c56a4180-65aa-42ec-a945-5fd21dec0538",
                      createdAt: "2026-09-16T13:00:00.000Z",
                      expiresAt: "2026-09-16T14:00:00.000Z",
                      lastExtendedAt: null,
                    },
                  },
                },
              },
            },
          },
          ...bearerErrors,
          400: {
            description: "Missing message ID",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
                example: {
                  success: false,
                  message: "Missing Message Id",
                },
              },
            },
          },
          404: {
            description: "Message not found or not owned by the session",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
                example: {
                  success: false,
                  message: "Message Not Found",
                },
              },
            },
          },
          500: {
            description: "Request failed",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
                example: {
                  success: false,
                  message: "Error marking message as read",
                },
              },
            },
          },
        },
      },
    },
    "/api/v1/inbox/messages/unread/all": {
      get: {
        tags: ["Messages"],
        summary: "Fetch all unread messages for the session",
        operationId: "getUnreadMessages",
        description:
          "Returns the unread messages of the session's active inbox, ordered by receivedAt descending, projected to the fields the inbox UI needs. Sessions with no active inbox receive 200 with an empty messages array rather than 404.",
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: "Unread messages list",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/UnreadMessagesResponse",
                },
                example: {
                  success: true,
                  message: "Unread messages fetched successfully",
                  data: {
                    session: {
                      id: "c56a4180-65aa-42ec-a945-5fd21dec0538",
                      createdAt: "2026-09-16T13:00:00.000Z",
                      expiresAt: "2026-09-16T14:00:00.000Z",
                      lastExtendedAt: null,
                    },
                    messages: [
                      {
                        id: "message-uuid",
                        subject: "Verification code",
                        sender: "Example Sender <sender@example.com>",
                        to: "generated-address@example.com",
                        receivedAt: "2026-09-16T13:10:00.000Z",
                        isRead: false,
                      },
                      {
                        id: "message-uuid-2",
                        subject: "Password reset",
                        sender: "Support <support@example.com>",
                        to: "generated-address@example.com",
                        receivedAt: "2026-09-16T12:45:00.000Z",
                        isRead: false,
                      },
                    ],
                  },
                },
              },
            },
          },
          ...bearerErrors,
          500: {
            description: "Request failed",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
                example: {
                  success: false,
                  message: "Error fetching unread messages",
                },
              },
            },
          },
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
              example: {
                timestamp: "1726491600",
                token: "mailgun-webhook-token",
                signature: "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
                recipient: "generated-address@example.com",
                sender: "sender@example.com",
                from: "Example Sender <sender@example.com>",
                subject: "Verification code",
                "body-mime": "message.eml",
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
              example: {
                timestamp: "1726491600",
                token: "mailgun-webhook-token",
                signature: "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
                recipient: "generated-address@example.com",
                "body-plain": "Your verification code is 123456.",
                "body-html": "<p>Your verification code is <strong>123456</strong>.</p>",
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
        description:
          "The raw session token returned as data.session.token by POST /api/v1/inbox or POST /api/v1/inbox/custom. Inbox-scoped routes additionally require the target inbox to belong to that session.",
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
      InboxId: {
        name: "id",
        in: "path",
        required: true,
        description: "Inbox UUID.",
        schema: {
          type: "string",
          format: "uuid",
        },
        example: "8a5f1a9d-0c52-4d54-9f40-4b5a6d2e0d92",
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
        required: ["session", "id", "address", "expiresAt"],
        properties: {
          session: {
            type: "object",
            required: ["token", "expiresAt"],
            properties: {
              token: {
                type: "string",
                description:
                  "Raw session bearer token. Returned only when the session is created; when an existing session is reused, the caller's own token is echoed back here.",
                example: "raw-session-token-returned-once",
              },
              expiresAt: {
                type: "string",
                format: "date-time",
                description:
                  "Session expiration. Never earlier than the inbox expiration, so it may outlive the inbox it was returned with.",
              },
            },
          },
          id: {
            type: "string",
            format: "uuid",
          },
          address: {
            type: "string",
            format: "email",
            example: "generated-address@example.com",
          },
          expiresAt: {
            type: "string",
            format: "date-time",
          },
        },
      },
      CustomInboxRequest: {
        type: "object",
        required: ["localPart"],
        properties: {
          localPart: {
            type: "string",
            maxLength: 64,
            pattern: "^[a-zA-Z0-9]+$",
            description:
              "Local part of the inbox address. Alphanumeric only, at most 64 characters. Not normalized, so it is stored and matched exactly as sent.",
            example: "mycustominbox",
          },
        },
      },
      SessionSummary: {
        type: "object",
        description:
          "Session record echoed inside message responses. The current controllers spread the full session row, so the payload also contains the owning session's id, tokenHash, and raw token; those internal fields are deliberately not documented here.",
        required: ["createdAt", "expiresAt"],
        properties: {
          id: {
            type: "string",
            format: "uuid",
          },
          createdAt: {
            type: "string",
            format: "date-time",
          },
          expiresAt: {
            type: "string",
            format: "date-time",
          },
          lastExtendedAt: {
            type: "string",
            format: "date-time",
            nullable: true,
          },
        },
      },
      SessionInfoResponse: {
        type: "object",
        required: ["success", "message", "data"],
        properties: {
          success: {
            type: "boolean",
            example: true,
          },
          message: {
            type: "string",
            example: "Session Info Fetched Success",
          },
          data: {
            type: "object",
            required: ["createdAt", "expiresAt", "lastExtendedAt", "inboxCount"],
            properties: {
              createdAt: {
                type: "string",
                format: "date-time",
              },
              expiresAt: {
                type: "string",
                format: "date-time",
              },
              lastExtendedAt: {
                type: "string",
                format: "date-time",
                nullable: true,
              },
              inboxCount: {
                type: "integer",
                minimum: 0,
              },
            },
          },
        },
      },
      SessionInboxesResponse: {
        type: "object",
        required: ["success", "message", "data"],
        properties: {
          success: {
            type: "boolean",
            example: true,
          },
          message: {
            type: "string",
            example: "Session Inboxes Fetched Success",
          },
          data: {
            type: "object",
            required: ["inboxes"],
            properties: {
              inboxes: {
                type: "array",
                items: {
                  $ref: "#/components/schemas/SessionInboxSummary",
                },
              },
            },
          },
        },
      },
      SessionInboxSummary: {
        type: "object",
        required: ["id", "address", "localPart", "domain", "createdAt", "expiresAt", "messageCount"],
        properties: {
          id: {
            type: "string",
            format: "uuid",
          },
          address: {
            type: "string",
            format: "email",
          },
          localPart: {
            type: "string",
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
          messageCount: {
            type: "integer",
            minimum: 0,
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
            description: "Message summary for the inbox.",
            required: ["count"],
            properties: {
              count: {
                type: "integer",
                minimum: 0,
                description: "Number of messages currently stored in the inbox.",
              },
            },
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
      DeleteInboxResponse: {
        type: "object",
        required: ["success", "message", "data"],
        properties: {
          success: {
            type: "boolean",
            example: true,
          },
          message: {
            type: "string",
            example: "Inbox deleted successfully",
          },
          data: {
            type: "object",
            required: ["id", "deletedMessages", "deletedAttachments"],
            properties: {
              id: {
                type: "string",
                format: "uuid",
                description: "UUID of the inbox that was permanently removed.",
              },
              deletedMessages: {
                type: "integer",
                minimum: 0,
                description: "Number of message rows removed with the inbox.",
              },
              deletedAttachments: {
                type: "integer",
                minimum: 0,
                description: "Number of attachment rows removed with the inbox's messages.",
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
        description: "Public message projection returned by GET /api/v1/inbox/messages/{id}. It is a hand-built subset of the Prisma Message model: persisted fields such as id, textBody, htmlBody, rawObjectKey, rawSizeBytes, rawHtmlSize, sizeBytes, parsedAt, and errorMessage are not returned, and attachment sizeBytes/objectKey are renamed to size/url.",
        required: ["subject", "sender", "from", "to", "body", "inboxId", "attachments", "isRead", "status", "receivedAt", "expiresAt", "createdAt"],
        properties: {
          subject: {
            type: "string",
            nullable: true,
          },
          sender: {
            type: "string",
            description:
              "Display string built from fromName and fromAddress as \"Name <address>\", falling back to the bare address when no display name was parsed.",
            example: "Example Sender <sender@example.com>",
          },
          from: {
            type: "string",
            format: "email",
            description: "Sender address, projected from the persisted fromAddress.",
          },
          to: {
            type: "string",
            format: "email",
            description: "Recipient address, projected from the persisted toAddress.",
          },
          body: {
            type: "string",
            description:
              "Sanitized HTML when the message has an HTML body, otherwise the plain-text body, otherwise an empty string. Each read re-runs the sanitizer over the stored HTML.",
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
        required: ["success", "message", "data"],
        properties: {
          success: {
            type: "boolean",
            example: true,
          },
          message: {
            type: "string",
            example: "Message marked as read",
          },
          data: {
            type: "object",
            required: ["session"],
            properties: {
              session: {
                $ref: "#/components/schemas/SessionSummary",
              },
            },
          },
        },
      },
      InboxMessagesResponse: {
        type: "object",
        required: ["success", "message", "data"],
        properties: {
          success: {
            type: "boolean",
            example: true,
          },
          message: {
            type: "string",
            example: "Inbox messages fetched successfully",
          },
          data: {
            type: "object",
            required: ["session", "messages"],
            properties: {
              session: {
                $ref: "#/components/schemas/SessionSummary",
              },
              messages: {
                type: "array",
                items: {
                  $ref: "#/components/schemas/InboxMessageSummary",
                },
              },
            },
          },
        },
      },
      InboxMessageSummary: {
        type: "object",
        required: ["id", "subject", "fromName", "fromAddress", "toAddress", "isRead", "status", "receivedAt", "expiresAt", "attachmentCount"],
        properties: {
          id: {
            type: "string",
            format: "uuid",
          },
          subject: {
            type: "string",
            nullable: true,
          },
          fromName: {
            type: "string",
            nullable: true,
          },
          fromAddress: {
            type: "string",
            format: "email",
          },
          toAddress: {
            type: "string",
            format: "email",
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
          attachmentCount: {
            type: "integer",
            minimum: 0,
          },
        },
      },
      UnreadMessagesResponse: {
        type: "object",
        required: ["success", "message", "data"],
        properties: {
          success: {
            type: "boolean",
            example: true,
          },
          message: {
            type: "string",
            example: "Unread messages fetched successfully",
          },
          data: {
            type: "object",
            required: ["session", "messages"],
            properties: {
              session: {
                $ref: "#/components/schemas/SessionSummary",
              },
              messages: {
                type: "array",
                items: {
                  $ref: "#/components/schemas/UnreadMessage",
                },
              },
            },
          },
        },
      },
      UnreadMessage: {
        type: "object",
        required: ["id", "subject", "sender", "to", "receivedAt", "isRead"],
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
            description: "Formatted sender value using fromName and fromAddress when present.",
          },
          to: {
            type: "string",
            format: "email",
          },
          receivedAt: {
            type: "string",
            format: "date-time",
          },
          isRead: {
            type: "boolean",
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
      SocketJoinInboxPayload: {
        type: "object",
        required: ["address", "token"],
        properties: {
          address: {
            type: "string",
            format: "email",
            description:
              "Temporary inbox email address. Matched case-insensitively.",
            example: "user-abc123@domain.com",
          },
          token: {
            type: "string",
            description:
              "Raw session token returned as data.session.token when the inbox was created. The room is granted only when this token hashes to the session that owns the address.",
            example: "raw-session-token",
          },
        },
      },
      SocketJoinInboxSuccessResponse: {
        type: "object",
        required: ["success", "room"],
        properties: {
          success: {
            type: "boolean",
            example: true,
          },
          room: {
            type: "string",
            description: "Socket.IO room name subscribed to (inbox:<inboxId>).",
            example: "inbox:c56a4180-65aa-42ec-a945-5fd21dec0538",
          },
        },
      },
      SocketJoinInboxErrorResponse: {
        type: "object",
        required: ["success", "error"],
        properties: {
          success: {
            type: "boolean",
            example: false,
          },
          error: {
            type: "string",
            enum: [
              "address and token are required",
              "invalid or expired inbox credentials",
              "unable to validate inbox credentials",
            ],
            example: "invalid or expired inbox credentials",
          },
        },
      },
      SocketLeaveInboxPayload: {
        type: "object",
        required: ["inboxId"],
        properties: {
          inboxId: {
            type: "string",
            format: "uuid",
            description: "Unique inbox UUID to unsubscribe from.",
            example: "c56a4180-65aa-42ec-a945-5fd21dec0538",
          },
        },
      },
      SocketLeaveInboxSuccessResponse: {
        type: "object",
        required: ["success", "room"],
        properties: {
          success: {
            type: "boolean",
            example: true,
          },
          room: {
            type: "string",
            example: "inbox:c56a4180-65aa-42ec-a945-5fd21dec0538",
          },
        },
      },
      SocketLeaveInboxErrorResponse: {
        type: "object",
        required: ["success", "error"],
        properties: {
          success: {
            type: "boolean",
            example: false,
          },
          error: {
            type: "string",
            example: "inboxId is required",
          },
        },
      },
      SocketMessageNewEvent: {
        type: "object",
        required: [
          "id",
          "inboxId",
          "toAddress",
          "fromAddress",
          "subject",
          "receivedAt",
        ],
        properties: {
          id: {
            type: "string",
            format: "uuid",
            description: "Unique message UUID.",
            example: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
          },
          inboxId: {
            type: "string",
            format: "uuid",
            description: "Unique inbox UUID that received the email.",
            example: "c56a4180-65aa-42ec-a945-5fd21dec0538",
          },
          toAddress: {
            type: "string",
            format: "email",
            description: "Recipient email address.",
            example: "user-abc123@domain.com",
          },
          fromAddress: {
            type: "string",
            format: "email",
            description: "Sender's email address.",
            example: "sender@example.com",
          },
          subject: {
            type: "string",
            nullable: true,
            description: "Email subject line.",
            example: "Your verification code",
          },
          receivedAt: {
            type: "string",
            format: "date-time",
            description: "ISO timestamp when the email was received.",
            example: "2026-09-17T09:00:00.000Z",
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
        description: "Subscribes the client socket to an inbox room after validating credentials.",
        payload: {
          $ref: "#/components/schemas/SocketJoinInboxPayload",
        },
        acknowledgement: {
          success: {
            $ref: "#/components/schemas/SocketJoinInboxSuccessResponse",
          },
          error: {
            $ref: "#/components/schemas/SocketJoinInboxErrorResponse",
          },
        },
      },
      "leave-inbox": {
        direction: "client-to-server",
        description: "Unsubscribes the client socket from an inbox room.",
        payload: {
          $ref: "#/components/schemas/SocketLeaveInboxPayload",
        },
        acknowledgement: {
          success: {
            $ref: "#/components/schemas/SocketLeaveInboxSuccessResponse",
          },
          error: {
            $ref: "#/components/schemas/SocketLeaveInboxErrorResponse",
          },
        },
      },
      "message:new": {
        direction: "server-to-client",
        description: "Pushed to clients in an inbox room when a new email is ingested for that inbox.",
        payload: {
          $ref: "#/components/schemas/SocketMessageNewEvent",
        },
      },
    },
  },
};

export default swaggerDefinition;
