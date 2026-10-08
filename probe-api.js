#!/usr/bin/env node
'use strict';
// Throwaway probe: verify the live API against the documented spec.
const BASE = 'https://in-de9c7b11c05f429faa157ace63cb4ffd.ecs.eu-west-1.on.aws';

async function call(method, path, { token, body } = {}) {
  const headers = { Accept: 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  try {
    const res = await fetch(BASE + path, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    const text = await res.text();
    let json = null;
    try { json = JSON.parse(text); } catch { /* not json */ }
    return { status: res.status, json, raw: text.slice(0, 400) };
  } catch (error) {
    return { status: 0, error: error.message };
  }
}

const show = (label, r) => {
  const body = r.json ? JSON.stringify(r.json) : r.raw || r.error;
  console.log(`\n### ${label}\n  status=${r.status}  ${String(body).slice(0, 700)}`);
};

(async () => {
  show('GET /', await call('GET', '/'));
  show('GET /api/v1/health', await call('GET', '/api/v1/health'));

  const created = await call('POST', '/api/v1/inbox');
  show('POST /api/v1/inbox', created);

  const d = created.json?.data;
  const sessionToken = d?.session?.token;
  const inboxId = d?.id;
  console.log('\n>> sessionToken:', sessionToken ? sessionToken.slice(0, 12) + '...' : '(none)');
  console.log('>> inboxId:', inboxId || '(none)');
  console.log('>> address:', d?.address || '(none)');
  console.log('>> top-level data keys:', d ? Object.keys(d).join(', ') : '(none)');
  if (!sessionToken || !inboxId) { console.log('!! cannot continue without token+id'); return; }

  show('GET /api/v1/session', await call('GET', '/api/v1/session', { token: sessionToken }));
  show('GET /api/v1/session/inboxes', await call('GET', '/api/v1/session/inboxes', { token: sessionToken }));
  show(`GET /api/v1/inbox/${inboxId}`, await call('GET', `/api/v1/inbox/${inboxId}`, { token: sessionToken }));
  show(`PATCH /api/v1/inbox/extend/${inboxId}`, await call('PATCH', `/api/v1/inbox/extend/${inboxId}`, { token: sessionToken }));

  // Documented routing bug: GET /api/v1/inbox/:id shadows the /messages sub-router.
  show('GET /api/v1/inbox/messages?inboxId=...', await call('GET', `/api/v1/inbox/messages?inboxId=${inboxId}`, { token: sessionToken }));
  show('GET /api/v1/inbox/messages (no query)', await call('GET', '/api/v1/inbox/messages', { token: sessionToken }));
  show('GET /api/v1/inbox/messages/unread/all', await call('GET', '/api/v1/inbox/messages/unread/all', { token: sessionToken }));

  // Session reuse: a second create with the bearer token should reuse the session.
  const second = await call('POST', '/api/v1/inbox', { token: sessionToken });
  show('POST /api/v1/inbox (reuse session)', second);
  console.log('>> second inbox id:', second.json?.data?.id || '(none)');
  console.log('>> echoed token matches session token:', second.json?.data?.session?.token === sessionToken);

  // Socket.IO: connect at the origin root and join the inbox room.
  const { io } = require('socket.io-client');
  const socket = io(BASE, { transports: ['websocket', 'polling'], timeout: 8000 });
  await new Promise((resolve) => {
    let settled = false;
    const done = (msg) => {
      if (settled) return;
      settled = true;
      console.log('\n### socket result: ' + msg);
      try { socket.close(); } catch {}
      resolve();
    };
    socket.on('connect', () => {
      console.log('\n### socket connected id=' + socket.id);
      socket.emit('join-inbox', { address: d.address, token: sessionToken }, (ack) => {
        console.log('### join-inbox ack: ' + JSON.stringify(ack));
        done('join-inbox ack received');
      });
    });
    socket.on('message:new', (ev) => console.log('### message:new ' + JSON.stringify(ev)));
    socket.on('connect_error', (e) => done('connect_error: ' + e.message));
    setTimeout(() => done('timed out waiting for ack'), 12000);
  });

  console.log('\nPROBE COMPLETE');
})();
