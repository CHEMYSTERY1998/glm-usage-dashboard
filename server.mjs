#!/usr/bin/env node

/**
 * GLM Plan Usage Dashboard Server
 *
 * Proxies API requests to avoid CORS issues and serves the dashboard HTML.
 *
 * Required environment variables:
 *   ANTHROPIC_BASE_URL  - e.g. https://api.z.ai/api/anthropic or https://open.bigmodel.cn/api/anthropic
 *   ANTHROPIC_AUTH_TOKEN - your authentication token
 *
 * Usage:
 *   node server.mjs [port]
 *   node server.mjs       # defaults to 3000
 *   node server.mjs 8080  # uses port 8080
 */

import http from 'http';
import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = parseInt(process.argv[2] || '3000', 10);

const baseUrl = process.env.ANTHROPIC_BASE_URL || '';
const authToken = process.env.ANTHROPIC_AUTH_TOKEN || '';

if (!baseUrl || !authToken) {
  console.error('Missing required environment variables:');
  if (!baseUrl) console.error('  ANTHROPIC_BASE_URL');
  if (!authToken) console.error('  ANTHROPIC_AUTH_TOKEN');
  console.error('\nExample:');
  console.error('  export ANTHROPIC_BASE_URL="https://api.z.ai/api/anthropic"');
  console.error('  export ANTHROPIC_AUTH_TOKEN="your-token-here"');
  console.error('  node server.mjs');
  process.exit(1);
}

let parsedBaseUrl;
try {
  parsedBaseUrl = new URL(baseUrl);
} catch {
  console.error('Invalid ANTHROPIC_BASE_URL:', baseUrl);
  process.exit(1);
}

const baseDomain = `${parsedBaseUrl.protocol}//${parsedBaseUrl.host}`;
const isZhipu = baseUrl.includes('open.bigmodel.cn') || baseUrl.includes('dev.bigmodel.cn');
const platform = isZhipu ? 'ZHIPU' : 'ZAI';

const API_ENDPOINTS = {
  modelUsage: `${baseDomain}/api/monitor/usage/model-usage`,
  toolUsage: `${baseDomain}/api/monitor/usage/tool-usage`,
  quotaLimit: `${baseDomain}/api/monitor/usage/quota/limit`,
};

function proxyRequest(targetUrl, query, res) {
  const parsed = new URL(targetUrl);
  const httpModule = parsed.protocol === 'https:' ? https : http;
  const options = {
    hostname: parsed.hostname,
    port: parsed.port || (parsed.protocol === 'https:' ? 443 : 80),
    path: parsed.pathname + (query || ''),
    method: 'GET',
    headers: {
      'Authorization': authToken,
      'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
      'Content-Type': 'application/json',
    },
  };

  const proxyReq = httpModule.request(options, (proxyRes) => {
    let data = '';
    proxyRes.on('data', (chunk) => { data += chunk; });
    proxyRes.on('end', () => {
      res.writeHead(proxyRes.statusCode, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      });
      res.end(data);
    });
  });

  proxyReq.on('error', (err) => {
    res.writeHead(502, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: err.message }));
  });

  proxyReq.end();
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);

  // API proxy routes
  if (url.pathname === '/api/platform') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ platform, baseDomain }));
    return;
  }

  if (url.pathname === '/api/model-usage') {
    proxyRequest(API_ENDPOINTS.modelUsage, url.search, res);
    return;
  }

  if (url.pathname === '/api/tool-usage') {
    proxyRequest(API_ENDPOINTS.toolUsage, url.search, res);
    return;
  }

  if (url.pathname === '/api/quota-limit') {
    proxyRequest(API_ENDPOINTS.quotaLimit, url.search, res);
    return;
  }

  // Serve static files
  let filePath = url.pathname === '/' ? '/index.html' : url.pathname;
  const fullPath = path.join(__dirname, filePath);

  if (!fullPath.startsWith(__dirname)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  const ext = path.extname(fullPath);
  const mimeTypes = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.json': 'application/json',
    '.png': 'image/png',
    '.svg': 'image/svg+xml',
  };

  try {
    const content = fs.readFileSync(fullPath);
    res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
    res.end(content);
  } catch {
    res.writeHead(404);
    res.end('Not Found');
  }
});

server.listen(PORT, () => {
  console.log(`\n  Usage Dashboard running at:`);
  console.log(`  ➜  Local:   http://localhost:${PORT}`);
  console.log(`  ➜  Platform: ${platform}`);
  console.log(`  ➜  API:     ${baseDomain}\n`);
});
