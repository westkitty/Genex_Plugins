/* GENEX plugin-owned MCP bridge, Playwright mode.
 * All stdout remains JSON-RPC; untrusted browser processes are NOT OS-sandboxed.
 */
const GENEX_MODE = 'playwright';
import { spawn } from 'node:child_process';
import { statSync, readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { basename, isAbsolute, normalize, sep, join } from 'node:path';

const mode = GENEX_MODE;
// Canvas coordinate input is opt-in; default behavior and safe DOM tools need no extra CLI capabilities.
const canvasPointerEnabled = process.env.GENEX_CANVAS_POINTER_INPUT === 'true';
const upstreamPath = (process.env.GENEX_UPSTREAM_PATH || '').trim();
const upstreamDigest = (process.env.GENEX_UPSTREAM_SHA256 || '').trim().toLowerCase();
const configuredOrigin = (process.env.GENEX_ALLOWED_ORIGIN || 'http://127.0.0.1:5173').trim();
let approvedOrigin;
const ALLOWED = new Set(mode === 'playwright'
  ? ['browser_navigate', 'browser_snapshot', 'browser_click', 'browser_type', 'browser_press_key', 'browser_resize', 'browser_take_screenshot', 'browser_console_messages', 'browser_network_requests', 'browser_wait_for', 'browser_hover', 'browser_drag', 'browser_find', 'browser_fill_form', 'browser_select_option', ...(canvasPointerEnabled ? ['browser_mouse_move_xy', 'browser_mouse_click_xy', 'browser_mouse_drag_xy'] : [])]
  : ['load_url', 'take_screenshot', 'list_canvases', 'select_canvas', 'capture_frame', 'get_draw_calls', 'get_command_details', 'get_shaders', 'get_textures', 'get_webgl_state', 'get_context_info', 'get_console_logs']);
const MAX_LINE = 20 * 1024 * 1024;
const MAX_UPSTREAM_QUEUE = 24 * 1024 * 1024;
function reviewedGameOrigin(value) {
  try {
    const url = new URL(value);
    if (!['http:', 'https:'].includes(url.protocol) ||
        !['localhost', '127.0.0.1', '[::1]'].includes(url.hostname) ||
        !url.port || url.username || url.password || url.pathname !== '/' ||
        url.search || url.hash || value.replace(/\/$/, '') !== url.origin)
      throw new Error('invalid game origin');
    return url.origin;
  } catch {
    throw new Error('Configure an explicit loopback HTTP(S) game origin with port, e.g. http://127.0.0.1:5173');
  }
}
function permittedTarget(text) {
  if (typeof text !== 'string') return false;
  try {
    const url = new URL(text);
    return ['http:', 'https:'].includes(url.protocol) &&
      !url.username && !url.password && url.origin === approvedOrigin;
  } catch { return false; }
}
function verifyExecutable() {
  if (!isAbsolute(upstreamPath)) throw new Error('Set an absolute upstream file path in plugin Settings.');
  if (mode === 'playwright' && basename(upstreamPath) !== 'playwright-mcp' &&
      !normalize(upstreamPath).endsWith(join(sep,'node_modules','@playwright','mcp','cli.js')))
    throw new Error('Playwright upstream must be an official @playwright/mcp cli.js path or reviewed playwright-mcp alias');
  if (mode === 'spector' && !normalize(upstreamPath).endsWith(['mcp', 'dist', 'index.js'].join(sep)))
    throw new Error('Spector upstream must end in mcp/dist/index.js');
  const metadata = statSync(upstreamPath);
  if (!metadata.isFile()) throw new Error('Upstream entry is not a regular file');
  if (!/^[a-f0-9]{64}$/.test(upstreamDigest)) throw new Error('Configure reviewed upstream SHA-256 in plugin Settings before launching');
  if (metadata.size > 8 * 1024 * 1024) throw new Error('Upstream entry exceeds the 8 MiB verification limit');
  const actual = createHash('sha256').update(readFileSync(upstreamPath)).digest('hex');
  if (actual !== upstreamDigest) throw new Error('Upstream SHA-256 mismatch: refusing to execute changed code');
}
try { approvedOrigin = reviewedGameOrigin(configuredOrigin); verifyExecutable(); } catch (error) {
  process.stderr.write('GENEX ' + mode + ' bridge: ' + error.message + '\n');
  process.exit(78);
}
const argv = mode === 'playwright'
  ? [upstreamPath, '--headless', '--isolated', '--no-webmcp', ...(canvasPointerEnabled ? ['--caps=vision'] : [])]
  : [upstreamPath];
// GENEX runs packaged Electron as Node using ELECTRON_RUN_AS_NODE=1.
// Preserve this flag for our child; do not inherit arbitrary unrelated environment.
// Node is the same reviewed binary GENEX used to launch this bridge; never invoke a shell.
const child = spawn(process.execPath, argv, {
  shell: false, stdio: ['pipe', 'pipe', 'pipe'],
  env: { ELECTRON_RUN_AS_NODE: '1', PATH: process.env.PATH || '', HOME: process.env.HOME || '', TMPDIR: process.env.TMPDIR || '', LANG: process.env.LANG || 'C' },
});
const inFraming = { chunks: [], bytes: 0 }, outFraming = { chunks: [], bytes: 0 };
let shuttingDown = false, childGone = false, backpressured = false, inputBackpressured = false;
let stdoutEndTimer;
const listIds = new Set();
const inflightIds = new Set();
const CLIENT_METHODS = new Set(['initialize', 'ping', 'tools/list', 'tools/call', 'notifications/initialized', 'notifications/cancelled']);
const SERVER_NOTIFICATIONS = new Set(['notifications/message', 'notifications/progress', 'notifications/tools/list_changed']);
/** Release the host immediately if a native server crashes with pending requests. */
function failPending(reason) {
  const ids=[...inflightIds];
  inflightIds.clear();listIds.clear();
  for (const key of ids) {
    try { errorFor(JSON.parse(key), reason); }
    catch { /* IDs originated from JSON-RPC and should already be valid JSON. */ }
  }
}

function send(msg, rawLine) {
  // Forward checked but unchanged JSON-RPC replies without encoding a second giant JSON string.
  // tools/list results still go through serialization below because their tool list is filtered.
  const line = rawLine === undefined ? JSON.stringify(msg) : rawLine;
  if (!process.stdout.write(line + '\n') && !backpressured) {
    backpressured = true;
    // Honor the consumer's backpressure: otherwise large MCP replies accumulate in Node's heap.
    child.stdout.pause();
    process.stdout.once('drain', () => {
      backpressured = false;
      if (!shuttingDown && !childGone) child.stdout.resume();
    });
  }
}
function errorFor(id, text) {
  if (id === undefined || id === null) return;
  send({ jsonrpc: '2.0', id, error: { code: -32002, message: text } });
}
function fromHost(line) {
  if (!line.trim()) return;
  let msg;
  try { msg = JSON.parse(line); } catch {
    process.stderr.write('Invalid incoming JSON-RPC line discarded\n'); return;
  }
  if (!msg || typeof msg !== 'object' || Array.isArray(msg) || msg.jsonrpc !== '2.0') return;
  if (!CLIENT_METHODS.has(msg.method)) {
    errorFor(msg.id, 'MCP method is not permitted by GENEX ' + mode + ' plugin policy'); return;
  }
  // Tool invocation must be an attributable JSON-RPC request, never a notification.
  const isNotification = msg.method === 'notifications/initialized' || msg.method === 'notifications/cancelled';
  const validId = (typeof msg.id === 'string' && msg.id.length > 0 && msg.id.length <= 1024) ||
    (typeof msg.id === 'number' && Number.isSafeInteger(msg.id));
  if (!isNotification && !validId) {
    errorFor(msg.id, 'MCP requests require a string or integer request ID'); return;
  }
  if (isNotification && Object.hasOwn(msg, 'id')) {
    errorFor(msg.id, 'MCP notifications must not carry a request ID'); return;
  }
  if (msg.method === 'tools/call') {
    const name = msg.params?.name;
    if (!ALLOWED.has(name)) {
      errorFor(msg.id, 'Tool is not permitted by GENEX ' + mode + ' plugin policy'); return;
    }
    // MCP screenshot output names stay within the tool's workspace basename namespace.
    if (name === 'browser_take_screenshot') {
      const filename = msg.params?.arguments?.filename;
      if (filename !== undefined && (typeof filename !== 'string' ||
          filename.length > 120 || !/^[a-zA-Z0-9][a-zA-Z0-9_.-]*\.(?:png|jpe?g|webp)$/i.test(filename) ||
          filename.includes('..'))) {
        errorFor(msg.id, 'Specify a safe screenshot filename without directories (e.g. frame-01.png)'); return;
      }
    }
    if (name === 'browser_navigate' || name === 'load_url') {
      const url = msg.params?.arguments?.url;
      if (!permittedTarget(url)) {
        errorFor(msg.id, 'Direct navigation must target the configured game origin (' + configuredOrigin + ')'); return;
      }
    }
  }
  if (shuttingDown || childGone || child.stdin.destroyed || !child.stdin.writable) {
    errorFor(msg.id, 'GENEX ' + mode + ' upstream is no longer available'); return;
  }
  if (msg.method === 'notifications/cancelled') {
    const requestId=msg.params?.requestId;
    if (requestId !== undefined && requestId !== null) {
      inflightIds.delete(JSON.stringify(requestId));
      listIds.delete(JSON.stringify(requestId));
    }
  }
  const encoded = JSON.stringify(msg) + '\n';
  if (child.stdin.writableLength + Buffer.byteLength(encoded, 'utf8') > MAX_UPSTREAM_QUEUE) {
    errorFor(msg.id, 'GENEX MCP upstream input buffer limit reached'); return;
  }
  if (msg.id !== undefined && msg.id !== null) {
    const key=JSON.stringify(msg.id);
    if (inflightIds.has(key)) {errorFor(msg.id, 'Duplicate in-flight MCP request id');return;}
    if (inflightIds.size >= 128) {errorFor(msg.id, 'GENEX MCP in-flight request limit reached');return;}
    inflightIds.add(key);
    if (msg.method === 'tools/list') listIds.add(key);
  }
  try {
    // Backpressure must propagate in both directions, including large tool arguments.
    if (!child.stdin.write(encoded) && !inputBackpressured) {
      inputBackpressured = true;
      process.stdin.pause();
      child.stdin.once('drain', () => {
        inputBackpressured = false;
        if (!shuttingDown && !childGone) process.stdin.resume();
      });
    }
  } catch (error) {
    listIds.delete(JSON.stringify(msg.id));
    inflightIds.delete(JSON.stringify(msg.id));
    errorFor(msg.id, 'Failed to send MCP request to upstream: ' + error.message);
  }
}
function fromServer(line) {
  if (!line.trim()) return;
  let msg;
  try { msg = JSON.parse(line); } catch {
    // An upstream warning on stdout must not corrupt GENEX's MCP JSON-RPC transport.
    process.stderr.write('GENEX ' + mode + ' bridge dropped non-JSON upstream stdout\n'); return;
  }
  if (!msg || typeof msg !== 'object' || Array.isArray(msg) || msg.jsonrpc !== '2.0') {
    process.stderr.write('GENEX ' + mode + ' bridge dropped non-MCP upstream output\n'); return;
  }
  if (typeof msg.method === 'string') {
    if (!Object.hasOwn(msg, 'id') && SERVER_NOTIFICATIONS.has(msg.method)) send(msg, line);
    else process.stderr.write('GENEX ' + mode + ' bridge denied unsolicited upstream method\n');
    return;
  }
  if (!Object.hasOwn(msg, 'id')) return;
  const id = JSON.stringify(msg.id);
  if (!inflightIds.delete(id)) {
    process.stderr.write('GENEX ' + mode + ' bridge dropped unsolicited upstream response\n'); return;
  }
  if (listIds.delete(id) && Array.isArray(msg.result?.tools)) {
    msg.result.tools = msg.result.tools.filter(tool => tool && ALLOWED.has(tool.name));
    send(msg);
  } else send(msg, line);
}
/** Linear-time newline framing for large MCP snapshots/shaders.
 * Never concatenate and re-scan an incomplete multi-megabyte message on each stream chunk.
 */
function feed(kind, chunk, handler) {
  const frame = kind === 'in' ? inFraming : outFraming;
  let cursor = 0;
  while (cursor < chunk.length) {
    const nl = chunk.indexOf('\n', cursor);
    const segment = nl < 0 ? chunk.slice(cursor) : chunk.slice(cursor, nl);
    const size = Buffer.byteLength(segment);
    if (frame.bytes + size > MAX_LINE) {
      // A complete oversized line must fail closed too: silently dropping it
      // strands the matching JSON-RPC request until the host times out.
      process.stderr.write('GENEX ' + mode + ' MCP ' + kind + ' line exceeded 20 MiB; closing bridge\n');
      frame.chunks.length = 0;
      frame.bytes = 0;
      process.exitCode = 74;
      failPending('GENEX MCP message exceeded the 20 MiB frame limit');
      stop();
      return;
    } else if (segment.length) {
      frame.chunks.push(segment);
      frame.bytes += size;
    }
    if (nl >= 0) {
      const line = frame.chunks.join('');
      frame.chunks.length = 0;
      frame.bytes = 0;
      handler(line);
      cursor = nl + 1;
    } else break;
  }
}
function flush(kind, handler) {
  const frame = kind === 'in' ? inFraming : outFraming;
  const line = frame.chunks.join('');
  frame.chunks.length = 0;
  frame.bytes = 0;
  if (line.trim()) handler(line);
}
child.stdin.on('error', error => {
  // EPIPE on upstream shutdown is normal and should not throw an unhandled exception.
  process.stderr.write('GENEX ' + mode + ' upstream input closed: ' + error.message + '\n');
  childGone = true;
  failPending('GENEX ' + mode + ' upstream input closed before responding');
});
child.stdout.setEncoding('utf8');
child.stdout.on('data', chunk => feed('out', chunk, fromServer));
child.stdout.on('error', error => process.stderr.write('GENEX ' + mode + ' upstream output error: ' + error.message + '\n'));
child.stderr.on('data', chunk => process.stderr.write('[' + mode + ' upstream] ' + String(chunk).slice(0,4000)));
process.stdin.setEncoding('utf8');
process.stdin.on('data', chunk => feed('in', chunk, fromHost));
process.stdin.on('end', () => {
  // GENEX has disconnected: no consumer remains for future MCP responses.
  // Merely ending child stdin can strand the bridge if the upstream owns
  // open Chromium/WebGL handles, timers or other long-lived resources.
  flush('in', fromHost);
  if (!child.stdin.destroyed && child.stdin.writable) child.stdin.end();
  stop();
});
child.stdout.on('end', () => {
  flush('out', fromServer);
  // Give an actually exiting child one event-loop turn to deliver its 'close'
  // event and preserve the precise upstream-exited diagnostic. A live child
  // with a dead MCP output pipe cannot reply, so fail its requests promptly.
  if (!shuttingDown && !childGone) stdoutEndTimer = setTimeout(() => {
    stdoutEndTimer = undefined;
    if (!shuttingDown && !childGone) {
      failPending('GENEX ' + mode + ' upstream MCP output closed before responding');
      process.exitCode = 73;
      stop();
    }
  }, 35);
});
function stop() {
  if (shuttingDown) return;
  shuttingDown = true;
  if (!childGone) child.kill('SIGTERM');
  setTimeout(() => { if (!childGone) child.kill('SIGKILL'); }, 1500).unref();
}
process.on('SIGTERM', stop);
process.on('SIGINT', stop);
process.stdout.on('error', () => stop());
child.on('error', error => {
  process.stderr.write('Could not launch ' + mode + ' upstream: ' + error.message + '\n');
  childGone = true;
  failPending('GENEX ' + mode + ' upstream exited during startup');
  process.exitCode = 73;
});
child.on('close', (code, signal) => {
  clearTimeout(stdoutEndTimer);
  childGone = true;
  failPending('GENEX ' + mode + ' upstream exited before responding (exit ' + String(code ?? signal) + ')');
  if (code !== 0) process.stderr.write(mode + ' upstream exited with ' + String(code ?? signal) + '\n');
  process.stdin.pause();
  if (!process.exitCode) process.exitCode = shuttingDown ? 0 : (code === null ? 1 : code);
});
