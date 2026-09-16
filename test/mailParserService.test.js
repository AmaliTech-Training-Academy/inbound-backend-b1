import test from "node:test";
import assert from "node:assert/strict";
import { sanitizeHtmlBody } from "../src/api/v1/services/mailParserService.js";

test("sanitizes scripts and remote tracking images from HTML bodies", () => {
  const body = sanitizeHtmlBody(
    '<p>Hello</p><script>alert("xss")</script><img src="https://tracker.example/pixel.gif">'
  );

  assert.equal(body, "<p>Hello</p>");
  assert.doesNotMatch(body, /script|img|tracker/i);
});