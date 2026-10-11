import { probeConnector } from './probe.mjs';
import { stat, readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { isAbsolute, normalize, sep, join } from 'node:path';
/** Read-only entry status shared by the agent and the setup console. */
async function checkStatus(ctx) {
    const settings = await ctx.host('settings.read');
    const path = String(settings['upstream-path'] || '').trim();
    const configuredDigest = String(settings['upstream-sha256'] || '').trim().toLowerCase();
    if (!path) return { ready: false, configured: false, fileFound: false, reason: 'Configure the absolute Spector.js MCP mcp/dist/index.js file in plugin Settings.' };
    if (!isAbsolute(path) || !normalize(path).endsWith(join(sep,'mcp','dist','index.js')))
      return { ready: false, configured: false, fileFound: false, reason: 'Path must be absolute and end in mcp/dist/index.js' };
    try {
      const f = await stat(path);
      if (!f.isFile()) return { ready: false, configured: true, fileFound: false, path, reason: 'Not a regular file' };
      if (f.size > 8 * 1024 * 1024) return { ready:false, configured:true, fileFound:true, path, reason:'Entry exceeds 8 MiB digest-check limit' };
      const detectedSha256 = createHash('sha256').update(await readFile(path)).digest('hex');
      const hashMatched = /^[a-f0-9]{64}$/.test(configuredDigest) && configuredDigest === detectedSha256;
      return { ready: false, configured: true, fileFound: true, path, detectedSha256, hashMatched,
        reason: hashMatched ? 'Entry digest matches. MCP connection and frame capture require live GENEX testing.' : 'Entry digest missing or mismatched. Review the changed entry script and its dependencies independently before approving a new SHA-256; do not blindly copy an unreviewed detected hash.' };
    } catch(error) {
      return { ready: false, configured: true, fileFound: false, path, reason: 'MCP server file unavailable: ' + error.message };
    }
}
/** Side-effect-free GENEX API 3 plugin activation. */
export async function activate() {
  return {
    async action(name, _args, ctx) {
      if (name === 'status') return checkStatus(ctx);
      if (name === 'probe') return probeConnector(ctx,["load_url", "capture_frame"]);
      throw new Error('Unknown action ' + name);
    },
    async tool(name, _args, ctx) {
      if (name === 'status') return checkStatus(ctx);
      if (name === 'probe') return probeConnector(ctx,["load_url", "capture_frame"]);
      throw new Error('Unknown tool ' + name);
    },
  };
}
