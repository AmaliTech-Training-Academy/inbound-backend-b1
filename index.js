#!/usr/bin/env node
'use strict';

const readline = require('readline');
const http = require('http');
const { execFile } = require('child_process');
const { io } = require('socket.io-client');

const COLOR = process.stdout.isTTY && !process.env.NO_COLOR;
const wrap = (code) => (s) => (COLOR ? `\x1b[${code}m${s}\x1b[0m` : String(s));

const dim = wrap('2');
const bold = wrap('1');
const cyan = wrap('36');
const green = wrap('32');
const yellow = wrap('33');
const red = wrap('31');
const magenta = wrap('35');

const API_BASE_URL = (process.env.INBOUND_API_BASE_URL || 'https://in-de9c7b11c05f429faa157ace63cb4ffd.ecs.eu-west-1.on.aws').replace(/\/+$/, '');
const API_ORIGIN = new URL(API_BASE_URL).origin;
const API_PATH = new URL(API_BASE_URL).pathname.replace(/\/+$/, '');
const SOCKET_PATH = `${API_PATH}/socket.io`;

const ALT_ON = '\x1b[?1049h';
const ALT_OFF = '\x1b[?1049l';
const CURSOR_HIDE = '\x1b[?25l';
const CURSOR_SHOW = '\x1b[?25h';
const HOME_CLEAR = '\x1b[H\x1b[0J';

const SPINNER = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];

const stripAnsi = (s) => String(s).replace(/\x1b\[[0-9;]*m/g, '');
const visLen = (s) => stripAnsi(s).length;

function truncate(text, max) {
  const plain = stripAnsi(text);
  if (plain.length <= max) return text;
  if (max <= 1) return plain.slice(0, Math.max(0, max));
  return plain.slice(0, max - 1) + '…';
}

function wrapText(text, max) {
  const out = [];
  for (const paragraph of String(text).split('\n')) {
    if (!paragraph.trim()) {
      out.push('');
      continue;
    }
    let line = '';
    for (const word of paragraph.split(/\s+/)) {
      if (!line.length) line = word;
      else if (line.length + 1 + word.length <= max) line += ' ' + word;
      else {
        out.push(line);
        line = word;
      }
    }
    if (line.length) out.push(line);
  }
  return out;
}

function relativeTime(date) {
  const seconds = Math.round((Date.now() - date.getTime()) / 1000);
  if (seconds < 0) return 'now';
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

function minutesLeft(date) {
  if (!date) return 0;
  return Math.max(0, Math.round((date.getTime() - Date.now()) / 60000));
}

function formatBytes(bytes) {
  const value = Number(bytes) || 0;
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`;
  return `${(value / 1024 / 1024).toFixed(1)} MB`;
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function htmlToText(html) {
  return String(html ?? '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|section|tr|li|h[1-6]|blockquote)>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/\r/g, '')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function openBrowser(url) {
  const command = process.platform === 'win32' ? 'cmd' : process.platform === 'darwin' ? 'open' : 'xdg-open';
  const args = process.platform === 'win32' ? ['/c', 'start', '', url] : [url];
  execFile(command, args, (error) => {
    if (error) setNotice(`Could not open a browser: ${error.message}`, 'warn');
  });
}

function copyToClipboard(text) {
  const payload = Buffer.from(String(text), 'utf8').toString('base64');
  process.stdout.write(`\x1b]52;c;${payload}\x07`);
}

async function request(path, { method = 'GET', token, body } = {}) {
  const headers = { Accept: 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body !== undefined) headers['Content-Type'] = 'application/json';

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const payload = await response.json().catch(() => null);

  if (!response.ok || payload?.success === false) {
    const error = new Error(payload?.message || `Request failed (${response.status})`);
    error.status = response.status;
    throw error;
  }
  return payload;
}

// Every route except POST /api/v1/inbox (and /custom), GET / and GET /api/v1/health is
// guarded by the session bearer token, which POST /api/v1/inbox returns once as
// data.session.token. Inbox-scoped routes take the inbox id in the path and additionally
// require that inbox to belong to the calling session. Each inbox therefore carries its
// own session token: creating an inbox without a bearer mints a fresh session.
const api = {
  async createInbox(localPart) {
    const payload = localPart
      ? await request('/api/v1/inbox/custom', { method: 'POST', body: { localPart } })
      : await request('/api/v1/inbox', { method: 'POST' });
    const data = payload?.data;
    if (!data?.address) throw new Error('Inbox creation returned no address');
    if (!data?.id) throw new Error('Inbox creation returned no id');
    if (!data?.session?.token) throw new Error('Inbox creation returned no session token');
    return data;
  },

  async sessionInfo(sessionToken) {
    const payload = await request('/api/v1/session', { token: sessionToken });
    return payload.data;
  },

  async sessionInboxes(sessionToken) {
    const payload = await request('/api/v1/session/inboxes', { token: sessionToken });
    return payload.data?.inboxes || [];
  },

  async inboxInfo(sessionToken, inboxId) {
    const payload = await request(`/api/v1/inbox/${encodeURIComponent(inboxId)}`, { token: sessionToken });
    return payload.data;
  },

  async deleteInbox(sessionToken, inboxId) {
    const payload = await request(`/api/v1/inbox/${encodeURIComponent(inboxId)}`, { method: 'DELETE', token: sessionToken });
    return payload.data;
  },

  async extendInbox(sessionToken, inboxId) {
    const payload = await request(`/api/v1/inbox/extend/${encodeURIComponent(inboxId)}`, { method: 'PATCH', token: sessionToken });
    return payload.data;
  },

  // GET /api/v1/inbox/messages is shadowed by GET /api/v1/inbox/:id in the server router,
  // which answers 404 for the list route (the spec documents this ordering bug and
  // suggests reordering src/api/v1/routes/inboxRoute.js). Try the real list first in case
  // that lands, then fall back to the unread projection — the only list route that
  // resolves today. The fallback sees unread mail only, so `complete` is reported back and
  // surfaced in the UI rather than silently passing off a partial list as the whole inbox.
  async listMessages(sessionToken, inboxId) {
    try {
      const payload = await request(`/api/v1/inbox/messages?inboxId=${encodeURIComponent(inboxId)}`, { token: sessionToken });
      return { messages: (payload.data?.messages || []).map(normalizeSummary), complete: true };
    } catch (error) {
      if (error.status !== 404) throw error;
      const payload = await request('/api/v1/inbox/messages/unread/all', { token: sessionToken });
      return { messages: (payload.data?.messages || []).map(normalizeSummary), complete: false };
    }
  },

  async unreadMessages(sessionToken) {
    const payload = await request('/api/v1/inbox/messages/unread/all', { token: sessionToken });
    return payload.data?.messages || [];
  },

  async getMessage(sessionToken, messageId) {
    const payload = await request(`/api/v1/inbox/messages/${encodeURIComponent(messageId)}`, { token: sessionToken });
    return payload.data;
  },

  async markRead(sessionToken, messageId) {
    return request(`/api/v1/inbox/messages/${encodeURIComponent(messageId)}/read`, { token: sessionToken });
  },

  // Binary route: returns the raw stored bytes with no envelope, so it is fetched
  // separately from request() and proxied through the local viewer.
  async attachment(sessionToken, attachmentId) {
    const response = await fetch(`${API_BASE_URL}/api/v1/inbox/attachments/${encodeURIComponent(attachmentId)}`, {
      headers: { Authorization: `Bearer ${sessionToken}` },
    });
    if (!response.ok) {
      const error = new Error(`Attachment unavailable (${response.status})`);
      error.status = response.status;
      throw error;
    }
    return response;
  },

  async health() {
    const payload = await request('/api/v1/health');
    return payload.message;
  },
};

const state = {
  screen: 'welcome',
  reveal: 0,
  inboxIndex: 0,
  messageIndex: 0,
  inboxes: [],
  sessions: new Map(),
  socket: null,
  socketStatus: 'offline',
  busy: null,
  spinner: 0,
  notice: null,
  filter: '',
  filterActive: false,
  input: null,
  helpReturn: 'inboxes',
  viewerServer: null,
  viewerUrl: null,
  viewerMessage: null,
  viewerInbox: null,
};

function setNotice(text, tone = 'ok') {
  state.notice = { text, tone };
  render();
  setTimeout(() => {
    if (state.notice && state.notice.text === text) {
      state.notice = null;
      render();
    }
  }, 3000);
}

async function withBusy(label, task) {
  if (state.busy) return undefined;
  state.busy = label;
  startTicker();
  try {
    return await task();
  } finally {
    state.busy = null;
    stopTicker();
    render();
  }
}

let ticker = null;

function startTicker() {
  if (ticker) return;
  ticker = setInterval(() => {
    state.spinner = (state.spinner + 1) % SPINNER.length;
    render();
  }, 80);
}

function stopTicker() {
  if (!ticker) return;
  clearInterval(ticker);
  ticker = null;
}

function ensureSocket() {
  if (state.socket) return state.socket;

  const socket = io(API_ORIGIN, {
    path: SOCKET_PATH,
    transports: ['websocket', 'polling'],
    autoConnect: true,
  });

  socket.on('connect', () => {
    state.socketStatus = 'online';
    for (const inbox of state.inboxes) joinInboxRoom(inbox);
    render();
  });

  socket.on('message:new', (event) => {
    receiveMessage(event);
  });

  socket.on('connect_error', (error) => {
    state.socketStatus = 'offline';
    setNotice(`Realtime connection failed: ${error.message}`, 'warn');
  });

  socket.on('disconnect', () => {
    state.socketStatus = 'offline';
    render();
  });

  state.socket = socket;
  return socket;
}

function joinInboxRoom(inbox) {
  const socket = state.socket;
  if (!socket?.connected) return;
  socket.emit('join-inbox', { address: inbox.address, token: inbox.sessionToken }, (result) => {
    if (!result?.success) {
      inbox.connected = false;
      setNotice(`Could not subscribe to ${inbox.address}: ${result?.error || 'unknown error'}`, 'warn');
      return;
    }
    inbox.connected = true;
    inbox.room = result.room;
    render();
  });
}

function leaveInboxRoom(inbox) {
  const socket = state.socket;
  if (!socket?.connected || !inbox.id) return;
  socket.emit('leave-inbox', { inboxId: inbox.id }, () => {});
}

function receiveMessage(event) {
  if (!event?.id) return;

  const inbox =
    state.inboxes.find((item) => item.id === event.inboxId) ||
    state.inboxes.find((item) => item.address === event.toAddress);
  if (!inbox) return;
  if (inbox.messages.some((message) => message.id === event.id)) return;

  inbox.messages.unshift({
    id: event.id,
    subject: event.subject || '(no subject)',
    from: event.fromAddress || 'unknown sender',
    fromAddress: event.fromAddress || '',
    to: event.toAddress || inbox.address,
    isRead: false,
    status: 'PARSED',
    receivedAt: new Date(event.receivedAt || Date.now()),
    attachmentCount: 0,
    text: '',
    htmlBody: '',
    attachments: [],
    loaded: false,
  });

  const current = currentInbox();
  const where = current === inbox ? 'here' : inbox.address;
  setNotice(`New mail ${where}: ${truncate(event.subject || '(no subject)', 40)}`);

  void loadMessageList(inbox, { silent: true });
}

function renderEmailPage(message, inbox) {
  const htmlBody = message.htmlBody || message.body || '<p>This message has no HTML body.</p>';
  const attachments = Array.isArray(message.attachments) ? message.attachments : [];
  // Attachment `url` is a Mailgun-internal token string, not a downloadable address. The
  // only way to the bytes is GET /api/v1/inbox/attachments/:id behind the bearer token,
  // so link to the local viewer's proxy route instead.
  const attachmentMarkup = attachments.length
    ? attachments
        .map((attachment) => {
          const name = escapeHtml(attachment.filename || 'unnamed attachment');
          const meta = `${escapeHtml(attachment.contentType || 'unknown type')} · ${escapeHtml(formatBytes(attachment.size))}`;
          const label = attachment.id
            ? `<a href="/attachment/${encodeURIComponent(attachment.id)}"><strong>${name}</strong></a>`
            : `<strong>${name}</strong>`;
          return `
        <li>
          ${label}
          <span>${meta}</span>
        </li>`;
        })
        .join('')
    : '<li class="muted">No attachments</li>';

  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escapeHtml(message.subject || '(no subject)')}</title>
<style>
body{margin:0;background:#eef2f5;color:#18232d;font:15px/1.5 system-ui,sans-serif}
main{max-width:980px;margin:32px auto;padding:0 20px}.card{background:#fff;border:1px solid #d7e0e7;border-radius:10px;box-shadow:0 8px 30px #20304014;overflow:hidden}
header{padding:24px 28px;border-bottom:1px solid #e5ebef}h1{margin:0 0 12px;font-size:24px}dl{display:grid;grid-template-columns:80px 1fr;gap:4px;margin:0;color:#52616d}dt{font-weight:700}dd{margin:0;overflow-wrap:anywhere}
.body{padding:0;background:#fff}iframe{display:block;width:100%;min-height:460px;border:0;background:#fff}
.attachments{padding:20px 28px;border-top:1px solid #e5ebef;background:#f8fafb}h2{font-size:16px;margin:0 0 10px}ul{padding:0;margin:0;list-style:none}li{display:flex;flex-wrap:wrap;gap:8px 16px;padding:8px 0;border-bottom:1px solid #e5ebef}li:last-child{border:0}li span,.muted{color:#667783}code{color:#486273;overflow-wrap:anywhere}a{color:#1d6fa5;text-decoration:none}a:hover{text-decoration:underline}
</style></head><body><main><section class="card"><header><h1>${escapeHtml(message.subject || '(no subject)')}</h1><dl>
<dt>From</dt><dd>${escapeHtml(message.sender || message.from || '')}</dd>
<dt>To</dt><dd>${escapeHtml(inbox?.address || message.to || '')}</dd>
<dt>Date</dt><dd>${escapeHtml(new Date(message.receivedAt).toLocaleString())}</dd>
</dl></header><div class="body"><iframe sandbox="allow-popups allow-popups-to-escape-sandbox" title="Email body"></iframe></div>
<section class="attachments"><h2>Attachments (${attachments.length})</h2><ul>${attachmentMarkup}</ul></section></section></main>
<script>document.querySelector('iframe').srcdoc=${JSON.stringify(htmlBody).replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026')};</script></body></html>`;
}

// Attachment bytes come back from the API as a bare binary body guarded by the session
// bearer token, which the browser has no way to send. Proxy them through this local
// server, which does hold the token, and pass the upstream headers through unchanged.
async function serveAttachment(attachmentId, res) {
  const fail = (status, text) => {
    if (!res.headersSent) res.writeHead(status, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end(text);
  };
  const inbox = state.viewerInbox;
  if (!inbox) return fail(404, 'No inbox selected');

  try {
    const upstream = await api.attachment(inbox.sessionToken, decodeURIComponent(attachmentId));
    res.writeHead(200, {
      'Content-Type': upstream.headers.get('content-type') || 'application/octet-stream',
      'Content-Disposition': upstream.headers.get('content-disposition') || 'attachment',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
    });
    res.end(Buffer.from(await upstream.arrayBuffer()));
  } catch (error) {
    fail(error.status || 502, `Attachment unavailable: ${error.message}`);
  }
}

function startEmailViewer() {
  const server = http.createServer((req, res) => {
    const pathname = new URL(req.url, 'http://127.0.0.1').pathname;
    if (pathname.startsWith('/attachment/')) {
      void serveAttachment(pathname.slice('/attachment/'.length), res);
      return;
    }
    if (pathname !== '/' || !state.viewerMessage) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Nothing to show');
      return;
    }
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
    res.end(renderEmailPage(state.viewerMessage, state.viewerInbox));
  });
  server.on('error', (error) => setNotice(`Viewer failed: ${error.message}`, 'warn'));
  server.listen(0, '127.0.0.1', () => {
    state.viewerServer = server;
    state.viewerUrl = `http://127.0.0.1:${server.address().port}/`;
  });
}

function openInBrowser(message, inbox) {
  if (!state.viewerUrl) {
    setNotice('The local viewer is still starting up.', 'warn');
    return;
  }
  state.viewerMessage = message;
  state.viewerInbox = inbox;
  openBrowser(state.viewerUrl);
  setNotice('Opened in your browser');
}

const width = () => Math.min(Math.max(process.stdout.columns || 80, 44), 78);

function box(title, lines, { accent = cyan } = {}) {
  const inner = width() - 4;
  const head = title ? ` ${title} ` : '';
  const bar = '─'.repeat(Math.max(0, inner + 2 - visLen(head)));
  const out = [accent('╭') + (head ? bold(head) : '') + accent(bar + '╮')];
  for (const line of lines) {
    const padding = ' '.repeat(Math.max(0, inner - visLen(line)));
    out.push(accent('│') + ' ' + line + padding + ' ' + accent('│'));
  }
  out.push(accent('╰' + '─'.repeat(inner + 2) + '╯'));
  return out;
}

function footer(hints) {
  return dim('  ') + hints.map(([key, label]) => `${bold(key)} ${dim(label)}`).join(dim('  ·  '));
}

function statusLine() {
  const parts = [];
  if (state.busy) parts.push(cyan(SPINNER[state.spinner]) + ' ' + dim(state.busy));
  else if (state.notice) parts.push((state.notice.tone === 'warn' ? yellow : green)('• ') + state.notice.text);
  if (state.input?.kind === 'delete') {
    parts.push(
      yellow('Delete ') + state.input.inbox.address + yellow(' on the server?') + dim('  ') + bold('y') + dim('/') + bold('n')
    );
  } else if (state.input?.kind === 'custom') {
    parts.push(cyan('address ') + state.input.value + cyan('▏') + dim('  alphanumeric, up to 64 characters'));
  } else if (state.filterActive) parts.push(cyan('/') + state.filter + cyan('▏'));
  else if (state.filter) parts.push(dim(`filter: ${state.filter}`));
  return parts;
}

const WORDMARK = [' ___ _  _ ___  ___  _   _ _  _ ___', '|_ _| \\| | _ )/ _ \\| | | | \\| |   \\', ' | || .` | _ \\ (_) | |_| | .` | |) |', '|___|_|\\_|___/\\___/ \\___/|_|\\_|___/'];

function renderWelcome() {
  const lines = [];
  const revealed = WORDMARK.slice(0, Math.min(state.reveal, WORDMARK.length));
  for (const line of revealed) lines.push(cyan(line));
  for (let i = revealed.length; i < WORDMARK.length; i++) lines.push('');
  lines.push('');
  if (state.reveal > 4) lines.push(bold('Temporary email, zero signup.'));
  if (state.reveal > 5) {
    lines.push(dim('Run as many inboxes as you need in one session.'));
    lines.push(dim('They share a single realtime connection and expire on their own.'));
  }
  lines.push('');
  lines.push(state.reveal > 6 ? green('  Press any key to continue') : '');
  return [...box('welcome', lines), '', footer([['q', 'quit']])];
}

function renderInboxes() {
  const lines = [];
  const list = visibleInboxes();

  if (!state.inboxes.length) {
    lines.push(dim('No addresses yet.'));
    lines.push('');
    lines.push(dim('Press ') + bold('n') + dim(' to reserve your first inbox.'));
  } else if (!list.length) {
    lines.push(yellow(`Nothing matches “${state.filter}”.`));
    lines.push(dim('Press Esc to clear the filter.'));
  } else {
    list.forEach((inbox, index) => {
      const selected = index === state.inboxIndex;
      const marker = selected ? cyan('❯') : ' ';
      const dot = inbox.expired ? red('✕') : inbox.connected ? green('●') : yellow('○');
      const address = selected ? bold(inbox.address) : inbox.address;
      const meta = [inbox.expired ? red('expired') : dim(`expires in ${minutesLeft(inbox.expiresAt)}m`)];
      meta.push(dim(`${inbox.messages.length} message${inbox.messages.length === 1 ? '' : 's'}`));
      const unread = unreadCount(inbox);
      if (unread) meta.push(yellow(`${unread} unread`));
      if (inbox.extends) meta.push(dim(`extended ${inbox.extends}×`));
      lines.push(`${marker} ${dot} ${address}`);
      lines.push(`    ${meta.join(dim('  ·  '))}`);
    });
  }

  for (const part of statusLine()) lines.push(part);

  const title = `Inboxes · ${state.inboxes.length} · realtime ${state.socketStatus}`;
  return [
    ...box(truncate(title, width() - 8), lines, { accent: magenta }),
    '',
    footer([
      ['↑↓', 'move'],
      ['⏎', 'open'],
      ['n', 'new'],
      ['e', 'extend'],
      ['c', 'copy'],
      ['d', 'forget'],
      ['r', 'refresh'],
      ['/', 'filter'],
      ['?', 'help'],
      ['q', 'quit'],
    ]),
  ];
}

function renderMessages() {
  const inbox = currentInbox();
  const lines = [];
  const inner = width() - 6;

  if (!inbox) {
    lines.push(yellow('No inbox selected.'));
    lines.push(dim('Press Esc and choose or create one.'));
  } else {
    const list = visibleMessages();
    if (inbox.expired) {
      lines.push(red('This inbox is gone — the API reports it as not found or expired.'));
      lines.push('');
    }
    if (!inbox.messages.length) {
      lines.push(dim('Waiting for mail at ') + green(inbox.address));
      lines.push('');
      lines.push(
        dim(
          inbox.partial
            ? 'No unread mail. Press r to fetch again.'
            : 'Nothing has arrived yet. Press r to fetch again.'
        )
      );
    } else if (!list.length) {
      lines.push(yellow(`Nothing matches “${state.filter}”.`));
    } else {
      list.forEach((message, index) => {
        const selected = index === state.messageIndex;
        const marker = selected ? cyan('❯') : ' ';
        const flag = message.isRead ? dim('○') : yellow('●');
        const when = relativeTime(message.receivedAt);
        const from = truncate(message.from, 22).padEnd(22);
        const badge = message.attachmentCount ? dim(` ✎${message.attachmentCount}`) : '';
        const space = Math.max(10, inner - 22 - when.length - 6 - visLen(badge));
        const subject = truncate(message.subject, space).padEnd(space);
        const row = `${flag} ${dim(from)} ${selected ? bold(subject) : subject} ${dim(when)}${badge}`;
        lines.push(`${marker} ${row}`);
      });
    }
  }

  for (const part of statusLine()) lines.push(part);

  const title = inbox ? `Inbox · ${inbox.address}` : 'Inbox';
  return [
    ...box(truncate(title, width() - 8), lines, { accent: green }),
    '',
    footer([
      ['↑↓', 'move'],
      ['⏎', 'read'],
      ['o', 'browser'],
      ['r', 'refresh'],
      ['c', 'copy address'],
      ['/', 'filter'],
      ['esc', 'back'],
    ]),
  ];
}

function renderMessage() {
  const inbox = currentInbox();
  const message = currentMessage();

  if (!inbox || !message) {
    state.screen = 'messages';
    return renderMessages();
  }

  const inner = width() - 6;
  const lines = [];
  lines.push(dim('From    ') + (message.sender || message.from || ''));
  lines.push(dim('To      ') + (message.to || inbox.address));
  lines.push(dim('Date    ') + message.receivedAt.toLocaleString());
  lines.push(dim('Status  ') + (message.status || 'PARSED') + (message.attachmentCount ? dim(`  ·  ${message.attachmentCount} attachment(s)`) : ''));
  lines.push('');
  lines.push(bold(truncate(message.subject, inner)));
  lines.push(dim('─'.repeat(inner)));

  const body = message.text || htmlToText(message.htmlBody || message.body) || 'This message has no readable body.';
  const bodyLines = wrapText(body, inner);
  const limit = 18;
  for (const line of bodyLines.slice(0, limit)) lines.push(line);
  if (bodyLines.length > limit) {
    lines.push('');
    lines.push(dim(`… ${bodyLines.length - limit} more lines. Press o to read the full message in your browser.`));
  }

  const attachments = Array.isArray(message.attachments) ? message.attachments : [];
  if (attachments.length) {
    lines.push('');
    lines.push(bold('Attachments'));
    for (const attachment of attachments) {
      lines.push('  ' + dim('• ') + attachment.filename + dim(`  ${formatBytes(attachment.size)} · ${attachment.contentType || 'unknown'}`));
    }
  }

  return [
    ...box('Message', lines, { accent: cyan }),
    '',
    footer([
      ['esc', 'back'],
      ['o', 'open in browser'],
      ['c', 'copy body'],
      ['u', 'unread'],
      ['q', 'quit'],
    ]),
  ];
}

function renderHelp() {
  const rows = [
    ['↑ / ↓ / j / k', 'Move the selection'],
    ['Enter', 'Open the selected inbox or message'],
    ['Esc / ← / b', 'Go back one screen'],
    ['n', 'Reserve a new inbox'],
    ['N', 'Reserve an inbox at an address you choose'],
    ['e', 'Extend the selected inbox by five minutes'],
    ['d', 'Forget the selected inbox and leave its room'],
    ['x', 'Delete the selected inbox on the server'],
    ['r', 'Refetch from the API'],
    ['o', 'Open the message in your browser'],
    ['c', 'Copy the address, or the message body'],
    ['i', 'Show inbox metadata from /api/v1/inbox/:id'],
    ['u', 'List unread mail for the selected inbox'],
    ['h', 'Ping /api/v1/health'],
    ['/', 'Filter the current list'],
    ['?', 'Toggle this screen'],
    ['q / Ctrl+C', 'Quit'],
  ];
  const lines = [bold('Keys'), ''];
  for (const [key, label] of rows) lines.push('  ' + cyan(key.padEnd(15)) + dim(label));

  lines.push('');
  lines.push(bold('Multiple inboxes'));
  lines.push('');
  for (const line of wrapText(
    'Every inbox you create stays live at once. They all share one Socket.IO connection, so mail lands in the right inbox in real time even while you are reading another one. Esc returns to the inbox list.',
    width() - 8
  )) {
    lines.push('  ' + dim(line));
  }

  lines.push('');
  lines.push(bold('Endpoints in use'));
  lines.push('');
  for (const endpoint of [
    'POST   /api/v1/inbox',
    'POST   /api/v1/inbox/custom',
    'GET    /api/v1/inbox/:id',
    'DELETE /api/v1/inbox/:id',
    'PATCH  /api/v1/inbox/extend/:id',
    'GET    /api/v1/inbox/messages',
    'GET    /api/v1/inbox/messages/:id',
    'GET    /api/v1/inbox/messages/:id/read',
    'GET    /api/v1/inbox/messages/unread/all',
    'GET    /api/v1/inbox/attachments/:attachmentId',
    'GET    /api/v1/session',
    'GET    /api/v1/session/inboxes',
    'GET    /api/v1/health',
    'SOCKET join-inbox · leave-inbox · message:new',
  ]) {
    lines.push('  ' + dim(endpoint));
  }

  lines.push('');
  lines.push(bold('Good to know'));
  lines.push('');
  for (const line of wrapText(
    'Sessions expire on their own; the API answers 410 once one has, and 429 past 100 requests per 15 minutes. Press e to buy five more minutes, or n for a fresh address. Each inbox gets its own session, so mail stays isolated per address. Note that GET /api/v1/inbox/messages is currently shadowed by the inbox route, so the list falls back to the unread projection and shows unread mail only.',
    width() - 8
  )) {
    lines.push('  ' + dim(line));
  }

  return [...box('Help', lines, { accent: yellow }), '', footer([['? / esc', 'back']])];
}

function renderGoodbye() {
  return [...box('', ['', '  ' + cyan('Inbound closed.') + dim('  Every address and message is gone.'), '']), ''];
}

function render() {
  if (!process.stdout.isTTY) return;
  const screens = {
    welcome: renderWelcome,
    inboxes: renderInboxes,
    messages: renderMessages,
    message: renderMessage,
    help: renderHelp,
    goodbye: renderGoodbye,
  };
  const lines = (screens[state.screen] || renderInboxes)();
  process.stdout.write(HOME_CLEAR + '\n' + lines.join('\n') + '\n');
}

function unreadCount(inbox) {
  return inbox.messages.reduce((total, message) => total + (message.isRead ? 0 : 1), 0);
}

function filterQuery() {
  return state.filter.trim().toLowerCase();
}

function visibleInboxes() {
  if (state.screen !== 'inboxes') return state.inboxes;
  const query = filterQuery();
  if (!query) return state.inboxes;
  return state.inboxes.filter((inbox) => inbox.address.toLowerCase().includes(query));
}

function currentInbox() {
  return visibleInboxes()[state.inboxIndex] || null;
}

function visibleMessages() {
  const inbox = currentInbox();
  if (!inbox) return [];
  if (state.screen === 'inboxes') return inbox.messages;
  const query = filterQuery();
  if (!query) return inbox.messages;
  return inbox.messages.filter(
    (message) =>
      message.subject.toLowerCase().includes(query) ||
      String(message.from || '').toLowerCase().includes(query)
  );
}

function currentMessage() {
  return visibleMessages()[state.messageIndex] || null;
}

function clampSelection() {
  const inboxes = visibleInboxes();
  state.inboxIndex = inboxes.length ? Math.min(state.inboxIndex, inboxes.length - 1) : 0;
  const messages = visibleMessages();
  state.messageIndex = messages.length ? Math.min(state.messageIndex, messages.length - 1) : 0;
}

// The two list projections disagree on names: /inbox/messages returns fromName,
// fromAddress, toAddress and attachmentCount, while /messages/unread/all returns sender
// and to with no attachment count. Accept either.
function normalizeSummary(raw) {
  return {
    id: raw.id,
    subject: raw.subject || '(no subject)',
    from: raw.fromName || raw.sender || raw.fromAddress || raw.from || 'unknown sender',
    fromAddress: raw.fromAddress || raw.from || '',
    to: raw.toAddress || raw.to || '',
    isRead: Boolean(raw.isRead),
    status: raw.status || 'PARSED',
    receivedAt: new Date(raw.receivedAt || Date.now()),
    attachmentCount: raw.attachmentCount || 0,
    text: '',
    htmlBody: '',
    attachments: [],
    loaded: false,
  };
}

function mergeSummaries(inbox, summaries) {
  const existing = new Map(inbox.messages.map((message) => [message.id, message]));
  inbox.messages = summaries.map((summary) => {
    const previous = existing.get(summary.id);
    if (!previous) return summary;
    return {
      ...summary,
      text: previous.text,
      htmlBody: previous.htmlBody,
      attachments: previous.attachments,
      loaded: previous.loaded,
    };
  });
  clampSelection();
}

function describeError(error) {
  if (error.status === 429) return 'Rate limited (429) — the API allows 100 requests per 15 minutes per IP.';
  if (error.status === 410) return 'Session expired (410). Create a new inbox with n.';
  if (error.status === 401) return 'Token rejected (401). Create a new inbox with n.';
  if (error.status === 409) return `${error.message} (409)`;
  if (error.status === 404) return `${error.message} (404)`;
  return error.message;
}

async function loadMessageList(inbox, { silent = false } = {}) {
  try {
    const { messages, complete } = await api.listMessages(inbox.sessionToken, inbox.id);
    mergeSummaries(inbox, messages);
    inbox.expired = false;
    inbox.partial = !complete;
    if (!silent) render();
  } catch (error) {
    if (error.status === 410 || error.status === 404) inbox.expired = true;
    if (!silent) setNotice(describeError(error), 'warn');
  }
}

async function createInbox(localPart) {
  await withBusy(localPart ? `Reserving ${localPart}…` : 'Reserving an address…', async () => {
    try {
      const created = await api.createInbox(localPart);
      const inbox = {
        id: created.id,
        address: created.address,
        sessionToken: created.session.token,
        createdAt: new Date(),
        expiresAt: new Date(created.expiresAt),
        extends: 0,
        messages: [],
        connected: false,
        expired: false,
        partial: false,
      };
      state.inboxes.unshift(inbox);
      state.sessions.set(inbox.sessionToken, {
        createdAt: null,
        expiresAt: new Date(created.session.expiresAt),
        lastExtendedAt: null,
        inboxCount: 1,
      });
      state.filter = '';
      state.filterActive = false;
      state.inboxIndex = 0;
      state.screen = 'messages';
      ensureSocket();
      joinInboxRoom(inbox);
      copyToClipboard(inbox.address);
      setNotice(`${inbox.address} — copied to clipboard`);
      await loadMessageList(inbox, { silent: true });
    } catch (error) {
      setNotice(describeError(error), 'warn');
    }
  });
}

async function refreshInboxes() {
  await withBusy('Refetching inboxes…', async () => {
    let failures = 0;
    await Promise.all(
      state.inboxes.map(async (inbox) => {
        try {
          const { messages, complete } = await api.listMessages(inbox.sessionToken, inbox.id);
          mergeSummaries(inbox, messages);
          inbox.expired = false;
          inbox.partial = !complete;
        } catch (error) {
          failures += 1;
          if (error.status === 410 || error.status === 404) inbox.expired = true;
        }
      })
    );
    await refreshSessions();
    const unread = state.inboxes.reduce((total, inbox) => total + unreadCount(inbox), 0);
    setNotice(
      failures
        ? `${failures} inbox(es) could not be refreshed`
        : `${state.inboxes.length} inbox(es) · ${unread} unread`
    );
  });
}

async function refreshSessions() {
  await Promise.all(
    [...state.sessions.keys()].map(async (token) => {
      try {
        const info = await api.sessionInfo(token);
        const inboxes = await api.sessionInboxes(token);
        state.sessions.set(token, {
          createdAt: new Date(info.createdAt),
          expiresAt: new Date(info.expiresAt),
          lastExtendedAt: info.lastExtendedAt ? new Date(info.lastExtendedAt) : null,
          inboxCount: info.inboxCount,
          addresses: inboxes.map((inbox) => inbox.address),
        });
      } catch {
        state.sessions.delete(token);
      }
    })
  );
}

async function openInbox() {
  const inbox = currentInbox();
  if (!inbox) return;
  state.messageIndex = 0;
  state.filter = '';
  state.screen = 'messages';
  await withBusy('Fetching messages…', async () => {
    await loadMessageList(inbox, { silent: true });
  });
}

async function openMessage() {
  const inbox = currentInbox();
  const message = currentMessage();
  if (!inbox || !message) return;

  await withBusy('Loading message…', async () => {
    try {
      const details = await api.getMessage(inbox.sessionToken, message.id);
      const body = details.body || '';
      // The public projection collapses the persisted textBody/htmlBody columns into one
      // `body` field holding sanitized HTML when the message has any, plain text otherwise.
      const isHtml = /<[a-z!/][^>]*>/i.test(body);
      Object.assign(message, {
        from: details.sender || details.from || message.from,
        fromAddress: details.from || message.fromAddress,
        to: details.to || inbox.address,
        subject: details.subject || message.subject,
        text: isHtml ? '' : body,
        htmlBody: isHtml ? body : '',
        body,
        attachments: details.attachments || [],
        status: details.status || message.status,
        attachmentCount: (details.attachments || []).length,
        receivedAt: new Date(details.receivedAt || message.receivedAt),
        isRead: true,
        loaded: true,
      });
      state.screen = 'message';
      try {
        await api.markRead(inbox.sessionToken, message.id);
      } catch (error) {
        setNotice(`Message opened, but read state was not saved: ${describeError(error)}`, 'warn');
      }
    } catch (error) {
      setNotice(describeError(error), 'warn');
    }
  });
}

async function extendInbox() {
  const inbox = currentInbox();
  if (!inbox) return;
  await withBusy('Extending…', async () => {
    try {
      const result = await api.extendInbox(inbox.sessionToken, inbox.id);
      inbox.expiresAt = new Date(result.expiresAt);
      inbox.extends = result.extendCount ?? inbox.extends + 1;
      inbox.expired = false;
      setNotice(`${inbox.address} now expires in ${minutesLeft(inbox.expiresAt)}m`);
    } catch (error) {
      setNotice(describeError(error), 'warn');
    }
  });
}

function forgetInbox() {
  const inbox = currentInbox();
  if (!inbox) return;
  leaveInboxRoom(inbox);
  state.inboxes = state.inboxes.filter((item) => item !== inbox);
  clampSelection();
  setNotice(`${inbox.address} forgotten`);
}

function promptCustomInbox() {
  state.input = { kind: 'custom', value: '' };
  render();
}

function confirmDelete() {
  const inbox = currentInbox();
  if (!inbox) return;
  state.input = { kind: 'delete', value: '', inbox };
  render();
}

// DELETE /api/v1/inbox/:id is a hard delete — inbox, messages and attachments go for good
// and the address frees up for reuse. Distinct from 'd', which only drops it locally.
async function deleteInboxOnServer(inbox) {
  if (!inbox) return;
  await withBusy('Deleting…', async () => {
    try {
      const result = await api.deleteInbox(inbox.sessionToken, inbox.id);
      leaveInboxRoom(inbox);
      state.inboxes = state.inboxes.filter((item) => item !== inbox);
      state.sessions.delete(inbox.sessionToken);
      clampSelection();
      const removed = result?.deletedMessages;
      setNotice(
        `${inbox.address} deleted` +
          (removed === undefined ? '' : ` · ${removed} message${removed === 1 ? '' : 's'} removed`)
      );
    } catch (error) {
      setNotice(describeError(error), 'warn');
    }
  });
}

async function showInboxInfo() {
  const inbox = currentInbox();
  if (!inbox) return;
  await withBusy('Fetching inbox info…', async () => {
    try {
      const info = await api.inboxInfo(inbox.sessionToken, inbox.id);
      inbox.expiresAt = new Date(info.expiresAt);
      inbox.extends = info.extendCount ?? inbox.extends;
      const count = info.message?.count;
      setNotice(
        `${info.address} · created ${new Date(info.createdAt).toLocaleTimeString()} · extended ${info.extendCount}×` +
          (count === undefined ? '' : ` · ${count} message${count === 1 ? '' : 's'}`)
      );
    } catch (error) {
      setNotice(describeError(error), 'warn');
    }
  });
}

async function showUnread() {
  const inbox = currentInbox();
  if (!inbox) return;
  await withBusy('Fetching unread…', async () => {
    try {
      const unread = await api.unreadMessages(inbox.sessionToken);
      setNotice(unread.length ? `${unread.length} unread in ${inbox.address}` : 'Nothing unread');
    } catch (error) {
      setNotice(describeError(error), 'warn');
    }
  });
}

async function checkHealth() {
  await withBusy('Checking the service…', async () => {
    try {
      setNotice(await api.health());
    } catch (error) {
      setNotice(describeError(error), 'warn');
    }
  });
}

function copySelection() {
  if (state.screen === 'message') {
    const message = currentMessage();
    if (!message) return;
    copyToClipboard(message.text || htmlToText(message.htmlBody) || message.subject);
    setNotice('Message body copied to clipboard');
    return;
  }
  const inbox = currentInbox();
  if (!inbox) {
    setNotice('No address to copy yet', 'warn');
    return;
  }
  copyToClipboard(inbox.address);
  setNotice(`${inbox.address} copied to clipboard`);
}

function openSelection() {
  const inbox = currentInbox();
  const message = currentMessage();
  if (!inbox || !message) {
    setNotice('Open a message first', 'warn');
    return;
  }
  if (!message.loaded) {
    void openMessage().then(() => {
      const fresh = currentMessage();
      if (fresh?.loaded) openInBrowser(fresh, inbox);
    });
    return;
  }
  openInBrowser(message, inbox);
}

function onKey(_input, key) {
  if (!key) return;

  if (key.ctrl && key.name === 'c') return quit();

  if (state.screen === 'welcome') {
    state.reveal = WORDMARK.length + 3;
    state.screen = 'inboxes';
    return render();
  }

  if (state.input) {
    const { kind } = state.input;
    if (kind === 'delete') {
      const target = state.input.inbox;
      state.input = null;
      if (key.name === 'y') return void deleteInboxOnServer(target);
    } else if (key.name === 'escape') {
      state.input = null;
    } else if (key.name === 'return') {
      const localPart = state.input.value.trim();
      state.input = null;
      if (localPart) void createInbox(localPart);
      else setNotice('No address given', 'warn');
    } else if (key.name === 'backspace') {
      state.input.value = state.input.value.slice(0, -1);
    } else if (key.sequence && key.sequence.length === 1 && key.sequence >= ' ' && !key.ctrl && !key.meta) {
      state.input.value += key.sequence;
    }
    return render();
  }

  if (state.filterActive) {
    if (key.name === 'escape') {
      state.filterActive = false;
      state.filter = '';
    } else if (key.name === 'return') {
      state.filterActive = false;
    } else if (key.name === 'backspace') {
      state.filter = state.filter.slice(0, -1);
    } else if (key.sequence && key.sequence.length === 1 && key.sequence >= ' ' && !key.ctrl && !key.meta) {
      state.filter += key.sequence;
    }
    clampSelection();
    return render();
  }

  const up = key.name === 'up' || key.name === 'k';
  const down = key.name === 'down' || key.name === 'j';
  const back = key.name === 'escape' || key.name === 'left' || key.name === 'b';
  const enter = key.name === 'return' || key.name === 'space';

  if (key.name === '?' || (key.shift && key.name === '/')) {
    if (state.screen === 'help') {
      state.screen = state.helpReturn;
    } else {
      state.helpReturn = state.screen;
      state.screen = 'help';
    }
    return render();
  }

  if (key.name === 'q') return quit();

  if (state.screen === 'help') {
    if (back || enter || key.name === 'h') state.screen = state.helpReturn;
    return render();
  }

  if (state.screen === 'inboxes') {
    const list = visibleInboxes();
    if (back && state.filter) {
      state.filter = '';
      clampSelection();
    } else if (key.name === '/') {
      state.filterActive = true;
      state.filter = '';
    } else if (key.name === 'n') return key.shift ? promptCustomInbox() : void createInbox();
    else if (key.name === 'e') return void extendInbox();
    else if (key.name === 'c') return copySelection();
    else if (key.name === 'd') return forgetInbox();
    else if (key.name === 'x') return confirmDelete();
    else if (key.name === 'i') return void showInboxInfo();
    else if (key.name === 'h') return void checkHealth();
    else if (key.name === 'r') return void refreshInboxes();
    else if (list.length && up) state.inboxIndex = (state.inboxIndex - 1 + list.length) % list.length;
    else if (list.length && down) state.inboxIndex = (state.inboxIndex + 1) % list.length;
    else if (list.length && (enter || key.name === 'right')) return void openInbox();
    return render();
  }

  if (state.screen === 'messages') {
    const list = visibleMessages();
    if (back) {
      if (state.filter) {
        state.filter = '';
        clampSelection();
      } else {
        state.screen = 'inboxes';
      }
    } else if (key.name === '/') {
      state.filterActive = true;
      state.filter = '';
    } else if (key.name === 'n') return key.shift ? promptCustomInbox() : void createInbox();
    else if (key.name === 'e') return void extendInbox();
    else if (key.name === 'c') return copySelection();
    else if (key.name === 'o') return openSelection();
    else if (key.name === 'd') return forgetInbox();
    else if (key.name === 'x') return confirmDelete();
    else if (key.name === 'u') return void showUnread();
    else if (key.name === 'i') return void showInboxInfo();
    else if (key.name === 'r') {
      const inbox = currentInbox();
      if (inbox) void withBusy('Fetching messages…', () => loadMessageList(inbox));
      return;
    } else if (list.length && up) state.messageIndex = (state.messageIndex - 1 + list.length) % list.length;
    else if (list.length && down) state.messageIndex = (state.messageIndex + 1) % list.length;
    else if (list.length && (enter || key.name === 'right')) return void openMessage();
    return render();
  }

  if (state.screen === 'message') {
    if (back || enter || key.name === 'left') state.screen = 'messages';
    else if (key.name === 'o') return openSelection();
    else if (key.name === 'c') return copySelection();
    else if (key.name === 'u') return void showUnread();
    return render();
  }
}

let exiting = false;

function cleanup() {
  if (process.stdin.isTTY) process.stdin.setRawMode(false);
  if (state.socket) {
    state.socket.removeAllListeners();
    state.socket.disconnect();
    state.socket = null;
  }
  if (state.viewerServer) {
    state.viewerServer.close();
    state.viewerServer = null;
  }
  process.stdout.write(CURSOR_SHOW + ALT_OFF);
}

function quit() {
  if (exiting) return;
  exiting = true;
  stopTicker();
  state.screen = 'goodbye';
  render();
  setTimeout(() => {
    cleanup();
    process.exit(0);
  }, 350);
}

function start() {
  if (!process.stdin.isTTY) {
    process.stdout.write('Inbound needs an interactive terminal.\n');
    process.exit(1);
  }

  readline.emitKeypressEvents(process.stdin);
  process.stdin.setRawMode(true);
  process.stdin.resume();
  process.stdin.on('keypress', onKey);
  process.stdout.on('resize', render);
  process.on('exit', cleanup);
  process.on('SIGINT', quit);

  startEmailViewer();
  ensureSocket();
  process.stdout.write(ALT_ON + CURSOR_HIDE);
  render();

  const reveal = setInterval(() => {
    state.reveal += 1;
    if (state.screen !== 'welcome' || state.reveal > WORDMARK.length + 3) {
      clearInterval(reveal);
      return;
    }
    render();
  }, 90);
}

if (require.main === module) {
  start();
}

module.exports = { api, normalizeSummary, API_BASE_URL };
