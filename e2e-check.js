#!/usr/bin/env node
'use strict';
// End-to-end check of the api layer against the live service.
const { api, normalizeSummary } = require('./index.js');

let failures = 0;
const ok = (cond, label, detail) => {
  console.log(`${cond ? 'PASS' : 'FAIL'}  ${label}${detail ? '  :: ' + detail : ''}`);
  if (!cond) failures += 1;
};

(async () => {
  try {
    const message = await api.health();
    ok(typeof message === 'string' && message.length > 0, 'api.health()', JSON.stringify(message));
  } catch (error) {
    ok(false, 'api.health()', error.message);
  }

  let inbox = null;
  try {
    const created = await api.createInbox();
    inbox = created;
    ok(Boolean(created.id), 'createInbox -> id', created.id);
    ok(Boolean(created.address), 'createInbox -> address', created.address);
    ok(Boolean(created.session?.token), 'createInbox -> session.token', created.session?.token ? 'present' : 'MISSING');
    ok(Boolean(created.expiresAt), 'createInbox -> expiresAt', created.expiresAt);
  } catch (error) {
    ok(false, 'api.createInbox()', error.message);
  }

  if (!inbox) {
    console.log('\ncannot continue without an inbox');
    process.exit(1);
  }
  const token = inbox.session.token;
  console.log(`\n>> inbox ${inbox.address} (${inbox.id})\n`);

  try {
    const info = await api.sessionInfo(token);
    ok(Boolean(info?.expiresAt), 'sessionInfo', `expiresAt=${info?.expiresAt} inboxCount=${info?.inboxCount}`);
  } catch (error) {
    ok(false, 'api.sessionInfo()', error.message);
  }

  try {
    const list = await api.sessionInboxes(token);
    ok(Array.isArray(list) && list.length > 0, 'sessionInboxes', `${list.length} inbox(es)`);
  } catch (error) {
    ok(false, 'api.sessionInboxes()', error.message);
  }

  try {
    const info = await api.inboxInfo(token, inbox.id);
    ok(info?.address === inbox.address, 'inboxInfo', `address=${info?.address} message.count=${info?.message?.count}`);
  } catch (error) {
    ok(false, 'api.inboxInfo()', error.message);
  }

  try {
    const ext = await api.extendInbox(token, inbox.id);
    ok(typeof ext?.extendCount === 'number', 'extendInbox', `extendCount=${ext?.extendCount} expiresAt=${ext?.expiresAt}`);
  } catch (error) {
    ok(false, 'api.extendInbox()', error.message);
  }

  try {
    const { messages, complete } = await api.listMessages(token, inbox.id);
    ok(Array.isArray(messages), 'listMessages', `complete=${complete} count=${messages.length}`);
    console.log(
      `      note: full-list route ${complete ? 'WORKS' : 'is shadowed -> fell back to the unread projection'}`
    );
  } catch (error) {
    ok(false, 'api.listMessages()', error.message);
  }

  try {
    const unread = await api.unreadMessages(token);
    ok(Array.isArray(unread), 'unreadMessages', `${unread.length} unread`);
  } catch (error) {
    ok(false, 'api.unreadMessages()', error.message);
  }

  // normalizeSummary must tolerate both projections.
  const listShape = normalizeSummary({
    id: '1', subject: 's', fromName: 'N', fromAddress: 'a@b.c', toAddress: 'x@y.z', attachmentCount: 2,
  });
  const unreadShape = normalizeSummary({ id: '2', subject: 's', sender: 'N <a@b.c>', to: 'x@y.z' });
  ok(listShape.from === 'N' && listShape.attachmentCount === 2 && listShape.to === 'x@y.z', 'normalizeSummary(list shape)', `from=${listShape.from} to=${listShape.to}`);
  ok(unreadShape.from === 'N <a@b.c>' && unreadShape.to === 'x@y.z', 'normalizeSummary(unread shape)', `from=${unreadShape.from} to=${unreadShape.to}`);

  // Custom address, then hard delete.
  const local = 'probe' + Math.floor(Math.random() * 1e6);
  try {
    const custom = await api.createInbox(local);
    ok(String(custom?.address || '').toLowerCase().startsWith(local.toLowerCase()), 'createInbox(localPart)', custom?.address);
    const del = await api.deleteInbox(custom.session.token, custom.id);
    ok(Boolean(del), 'deleteInbox', JSON.stringify(del));
  } catch (error) {
    ok(false, 'createInbox(localPart) / deleteInbox', `${error.status} ${error.message}`);
  }

  // Error paths.
  try {
    await api.inboxInfo('not-a-real-token', inbox.id);
    ok(false, 'inboxInfo with bad token', 'expected 401, no error thrown');
  } catch (error) {
    ok(error.status === 401, 'inboxInfo with bad token -> 401', `got ${error.status}: ${error.message}`);
  }

  try {
    await api.inboxInfo(token, '00000000-0000-0000-0000-000000000000');
    ok(false, 'inboxInfo with bogus id', 'expected 404, no error thrown');
  } catch (error) {
    ok(error.status === 404, 'inboxInfo with bogus id -> 404', `got ${error.status}: ${error.message}`);
  }

  // Socket.IO join, using the session token as the join credential.
  const { io } = require('socket.io-client');
  await new Promise((resolve) => {
    const socket = io('https://in-de9c7b11c05f429faa157ace63cb4ffd.ecs.eu-west-1.on.aws', {
      transports: ['websocket', 'polling'],
      timeout: 8000,
    });
    let settled = false;
    const done = (msg, pass) => {
      if (settled) return;
      settled = true;
      ok(pass, 'socket join-inbox', msg);
      try { socket.close(); } catch {}
      resolve();
    };
    socket.on('connect', () => {
      socket.emit('join-inbox', { address: inbox.address, token }, (ack) => done(JSON.stringify(ack), Boolean(ack?.success)));
    });
    socket.on('connect_error', (e) => done('connect_error: ' + e.message, false));
    setTimeout(() => done('timed out waiting for ack', false), 12000);
  });

  console.log(`\n${failures ? failures + ' FAILURE(S)' : 'ALL CHECKS PASSED'}`);
  process.exit(failures ? 1 : 0);
})();
