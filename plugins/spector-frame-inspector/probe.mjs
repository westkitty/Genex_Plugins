/** A bounded MCP handshake through this plugin's EXISTING fingerprinted proxy.
 * No HTTP navigation, no writes to a project and no automatic installation.
 * Still launches trusted native code: its exposed GENEX tool requires user confirmation.
 */
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const PROBE_TIMEOUT_MS = 12_000;
const MAX_REPLY_BYTES = 512 * 1024;
// All known handshake-era revisions share initialize/tools/list semantics. The 2026-07-28
// stateless era uses server/discover and is deliberately unsupported by this legacy probe.
const LEGACY_MCP_VERSIONS = new Set(['2024-11-05', '2025-03-26', '2025-06-18', '2025-11-25']);

export async function probeConnector(ctx, requiredTools) {
  if (ctx.signal?.aborted) throw new Error('Probe cancelled');
  const s = await ctx.host('settings.read');
  const source = String(s['upstream-path'] || '').trim();
  const digest = String(s['upstream-sha256'] || '').trim();
  if (!source || !digest) throw new Error('Configure both upstream-path and upstream-sha256 before probing');
  if (ctx.signal?.aborted) throw new Error('Probe cancelled');
  const proxy = fileURLToPath(new URL('./proxy.mjs', import.meta.url));
  // When process.execPath is packaged Electron, its nested children must also use Node mode.
  const child = spawn(process.execPath, [proxy], {
    shell: false, stdio: ['pipe', 'pipe', 'pipe'],
    env: {
      ELECTRON_RUN_AS_NODE: '1',
      GENEX_UPSTREAM_PATH: source,
      GENEX_UPSTREAM_SHA256: digest,
      GENEX_ALLOWED_ORIGIN: String(s['allowed-origin'] || 'http://127.0.0.1:5173').trim(),
      PATH: process.env.PATH || '', HOME: process.env.HOME || '',
      TMPDIR: process.env.TMPDIR || '', LANG: process.env.LANG || 'C',
    },
  });
  return new Promise((resolve, reject) => {
    let done = false, buffer = '', stderr = '', stage = 0, negotiatedVersion = null;
    let pageRequestId = 2, pageCount = 0;
    const cursors = new Set(), discovered = new Set();
    const close = (err, value) => {
      if (done) return;
      done = true;
      clearTimeout(timeout);
      ctx.signal?.removeEventListener('abort', abort);
      if (!child.stdin.destroyed) child.stdin.end();
      if (!child.killed) child.kill('SIGTERM');
      const cleanup = setTimeout(() => { if (child.exitCode === null) child.kill('SIGKILL'); }, 1200);
      cleanup.unref();
      if (err) reject(err); else resolve(value);
    };
    const abort = () => close(new Error('Probe cancelled by GENEX'));
    const timeout = setTimeout(() => close(new Error('MCP handshake timed out after 12 seconds')), PROBE_TIMEOUT_MS);
    timeout.unref();
    ctx.signal?.addEventListener('abort', abort, {once:true});
    child.stderr.on('data', chunk => {
      stderr = (stderr + String(chunk)).slice(-1800);
    });
    child.stdin.on('error', err => close(new Error('MCP upstream input failed: ' + err.message)));
    child.on('error', err => close(new Error('MCP probe could not spawn: ' + err.message)));
    child.on('close', code => {
      if (!done) close(new Error('MCP upstream terminated before handshake: ' + (stderr.trim() || `exit ${code}`)));
    });
    child.stdout.setEncoding('utf8');
    child.stdout.on('data', chunk => {
      if (done) return;
      buffer += chunk;
      if (Buffer.byteLength(buffer, 'utf8') > MAX_REPLY_BYTES) return close(new Error('Oversized MCP handshake response'));
      let pos;
      while (!done && (pos = buffer.indexOf('\n')) !== -1) {
        const line = buffer.slice(0,pos);buffer = buffer.slice(pos+1);
        if (!line.trim()) continue;
        let message;
        try { message = JSON.parse(line); }
        catch { return close(new Error('MCP bridge emitted invalid protocol JSON during handshake')); }
        if (stage === 0 && message.id === 1) {
          if (message.error || !message.result || !message.result.protocolVersion)
            return close(new Error('MCP initialization failed: ' + JSON.stringify(message.error || message.result)));
          if (!LEGACY_MCP_VERSIONS.has(message.result.protocolVersion))
            return close(new Error('Unsupported negotiated MCP protocol version: ' + String(message.result.protocolVersion)));
          negotiatedVersion = message.result.protocolVersion;
          stage = 1;
          send({jsonrpc:'2.0',method:'notifications/initialized'});
          send({jsonrpc:'2.0',id:2,method:'tools/list',params:{}});
        } else if (stage === 1 && message.id === pageRequestId) {
          if (message.error || !Array.isArray(message.result?.tools))
            return close(new Error('MCP tools/list failed: ' + JSON.stringify(message.error || message.result)));
          pageCount++;
          for (const item of message.result.tools) {
            if (typeof item?.name === 'string' && item.name.length <= 128) discovered.add(item.name);
          }
          if (discovered.size > 512) return close(new Error('MCP tool discovery exceeded the 512-name limit'));
          const cursor = message.result.nextCursor;
          if (cursor !== undefined && cursor !== null) {
            if (typeof cursor !== 'string' || !cursor || cursor.length > 1024 || cursors.has(cursor) || pageCount >= 20)
              return close(new Error('Invalid or looping MCP tools/list pagination cursor'));
            cursors.add(cursor);
            pageRequestId++;
            send({jsonrpc:'2.0',id:pageRequestId,method:'tools/list',params:{cursor}});
            continue;
          }
          const exposedTools = [...discovered];
          const missingTools = requiredTools.filter(name => !discovered.has(name));
          close(undefined, {
            handshake:true,negotiatedProtocol:negotiatedVersion,ready:missingTools.length===0,
            exposedTools, missingTools, exposedCount:exposedTools.length,
            pages:pageCount,
            note:missingTools.length
              ? 'Upstream answered MCP but essential game testing tools are unavailable.'
              : 'MCP handshake and tool discovery passed. Browser/game actions and GENEX app integration remain untested.',
          });
        }
      }
    });
    function send(value) {
      if (!done && child.stdin.writable) child.stdin.write(JSON.stringify(value) + '\n');
    }
    send({jsonrpc:'2.0',id:1,method:'initialize',params:{protocolVersion:'2025-06-18',capabilities:{},clientInfo:{name:'genex-plugin-probe',version:'0.9.1'}}});
  });
}
