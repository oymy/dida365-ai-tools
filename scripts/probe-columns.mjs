#!/usr/bin/env node
import { randomBytes } from 'crypto';
import { loadToken } from '../build/core/token-store.js';
import { SyncService } from '../build/core/services/sync.service.js';

const API_BASE_URL = 'https://api.dida365.com/api/v2';
const PRIVATE_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:95.0) Gecko/20100101 Firefox/95.0',
  'x-device': JSON.stringify({
    platform: 'web',
    os: 'OS X',
    device: 'Firefox 95.0',
    name: 'dida365-ai-tools',
    version: 4531,
    id: '6490' + randomBytes(10).toString('hex'),
    channel: 'website',
    campaign: '',
    websocket: '',
  }),
};

async function rawRequest(method, path, body) {
  const tokenData = await loadToken();
  if (!tokenData) throw new Error('Not authenticated. Run dida365 auth cookie <token> first.');
  const headers = {
    'Content-Type': 'application/json',
    Cookie: `t=${tokenData.token}`,
    ...PRIVATE_HEADERS,
  };
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await res.text();
  return { status: res.status, ok: res.ok, path, method, body, text };
}

async function main() {
  const sync = new SyncService();
  const data = await sync.fullSync();

  const projectIds = [...new Set(data.tasks.filter(t => t.columnId).map(t => t.projectId))].slice(0, 3);
  const columnIds = [...new Set(data.tasks.filter(t => t.columnId).map(t => t.columnId))].slice(0, 5);

  const probes = [];

  for (const projectId of projectIds) {
    probes.push(['GET', `/column?projectId=${encodeURIComponent(projectId)}`]);
    probes.push(['GET', `/project/${encodeURIComponent(projectId)}`]);
    probes.push(['GET', `/project/${encodeURIComponent(projectId)}/kanban`]);
    probes.push(['GET', `/project/${encodeURIComponent(projectId)}/columns`]);
    probes.push(['POST', '/column/query', { projectId }]);
    probes.push(['POST', '/column', { projectId, name: '__oc_probe_column__' }]);
  }

  for (const columnId of columnIds) {
    probes.push(['GET', `/column/${encodeURIComponent(columnId)}`]);
    probes.push(['PUT', '/column', { id: columnId, name: '__oc_probe_rename__' }]);
    probes.push(['DELETE', `/column?id=${encodeURIComponent(columnId)}`]);
  }

  const results = [];
  for (const [method, path, body] of probes) {
    try {
      const result = await rawRequest(method, path, body);
      results.push(result);
    } catch (error) {
      results.push({ method, path, body, error: String(error) });
    }
  }

  console.log(JSON.stringify({
    sampledProjectIds: projectIds,
    sampledColumnIds: columnIds,
    results,
  }, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
