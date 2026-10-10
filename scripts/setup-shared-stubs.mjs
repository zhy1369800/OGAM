import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sharedDir = path.resolve(__dirname, '../../shared');

console.log(`[setup-shared-stubs] Checking shared directory at: ${sharedDir}`);

// Packages definition and their stub entries
const packages = [
  {
    name: '@offgrid/models',
    dir: path.join(sharedDir, 'packages/models'),
    files: [
      {
        path: 'dist/index.js',
        content: `
module.exports = {
  REASONING_BUDGET_AUTO: 'auto',
  REASONING_BUDGET_OPTIONS: ['auto', 'low', 'medium', 'high'],
  reasoningBudgetLabel: (b) => b,
  DEFAULT_MAX_TOOL_CALLS: 5,
  MIN_MAX_TOOL_CALLS: 1,
  MAX_MAX_TOOL_CALLS: 20,
  normalizeMaxToolCalls: (n) => (typeof n === 'number' ? Math.max(1, Math.min(20, n)) : 5),
  callsWithinToolBudget: () => true,
  finalResponseFromToolResults: () => '',
  toolLimitFinalAnswerInstruction: () => '',
  toolPromptChars: () => 0,
  toolResultCharBudget: () => 4000,
  thinkingBudgetPayload: () => ({}),
  openRouterReasoningPayload: () => ({}),
  reasoningBudgetPayload: () => ({}),
  boundToolResult: (r) => r,
  MAX_TOOL_RESULT_CHARS: 20000,
  effectiveImageParameter: (p) => p,
  resolveImageParameters: (p) => p,
};
`,
      },
      {
        path: 'package.json',
        content: JSON.stringify(
          {
            name: '@offgrid/models',
            version: '0.0.1',
            main: 'dist/index.js',
          },
          null,
          2,
        ),
      },
    ],
  },
  {
    name: '@offgrid/sync',
    dir: path.join(sharedDir, 'packages/sync'),
    files: [
      {
        path: 'dist/index.js',
        content: `
module.exports = {
  hasProAccess: () => false,
  preprocessChatMarkdown: (text) => text,
  safeChatExternalUrl: (url) => url,
  PROMPT_ENHANCEMENT_STATUS: { IDLE: 'idle', GENERATING: 'generating', READY: 'ready', FAILED: 'failed' },
  chatListPreviewLine: () => '',
  XML_TOOL_CALL_PARAMETER_MARKER: 'parameter=',
  REASONING_DELIMITERS: [],
  TOOL_CALL_CLOSERS: ['</tool_call>', '<|tool_call|>', '</function>'],
  TOOL_CALL_OPENERS: ['<tool_call>', '<|tool_call|>', '<function='],
  XML_TOOL_CALL_FUNCTION_MARKER: 'function=',
  maxPartialTagSuffix: () => '',
  parseChatModelOutput: (o) => ({ thinking: null, response: o }),
  parseChatThinkingContent: (c) => ({ thinking: null, response: c }),
  partialTagSuffix: () => null,
  stripChatControlTokens: (t) => t,
};
`,
      },
      {
        path: 'dist/portable/index.js',
        content: `module.exports = {};`,
      },
      {
        path: 'dist/adapters/rn-tcp.js',
        content: `module.exports = { RnTcpTransport: class {} };`,
      },
      {
        path: 'dist/adapters/rn-discovery.js',
        content: `module.exports = { RnDiscovery: class {} };`,
      },
      {
        path: 'package.json',
        content: JSON.stringify(
          {
            name: '@offgrid/sync',
            version: '0.0.1',
            main: 'dist/index.js',
          },
          null,
          2,
        ),
      },
    ],
  },
  {
    name: '@offgrid/speech',
    dir: path.join(sharedDir, 'packages/speech'),
    files: [
      {
        path: 'dist/index.cjs',
        content: `
module.exports = {
  transcriptionLanguages: [],
  WAV_HEADER_BYTES: 44,
  WAV_HEADER_SCAN_BYTES: 44,
  planWavTrim: () => ({}),
};
`,
      },
      {
        path: 'package.json',
        content: JSON.stringify(
          {
            name: '@offgrid/speech',
            version: '0.0.1',
            main: 'dist/index.cjs',
          },
          null,
          2,
        ),
      },
    ],
  },
  {
    name: '@offgrid/ui',
    dir: path.join(sharedDir, 'packages/ui'),
    files: [
      {
        path: 'dist/index.js',
        content: `
module.exports = {
  sampleProgressRate: () => ({}),
  projectProgress: () => ({}),
};
`,
      },
      {
        path: 'package.json',
        content: JSON.stringify(
          {
            name: '@offgrid/ui',
            version: '0.0.1',
            main: 'dist/index.js',
          },
          null,
          2,
        ),
      },
    ],
  },
  {
    name: '@offgrid/rag',
    dir: path.join(sharedDir, 'packages/rag'),
    files: [
      {
        path: 'dist/index.js',
        content: `
module.exports = {
  chunkText: (text) => [{ content: text, position: 0 }],
};
`,
      },
      {
        path: 'package.json',
        content: JSON.stringify(
          {
            name: '@offgrid/rag',
            version: '0.0.1',
            main: 'dist/index.js',
          },
          null,
          2,
        ),
      },
    ],
  },
  {
    name: '@offgrid/automation',
    dir: path.join(sharedDir, 'packages/automation'),
    files: [
      {
        path: 'dist/index.js',
        content: `module.exports = {};`,
      },
      {
        path: 'package.json',
        content: JSON.stringify(
          {
            name: '@offgrid/automation',
            version: '0.0.1',
            main: 'dist/index.js',
          },
          null,
          2,
        ),
      },
    ],
  },
];

// Ensure shared/node_modules for Noble hashes
const sharedNodeModules = path.join(sharedDir, 'node_modules/@noble/hashes');
fs.mkdirSync(sharedNodeModules, { recursive: true });
for (const mod of ['hkdf.js', 'hmac.js', 'sha256.js']) {
  const modPath = path.join(sharedNodeModules, mod);
  if (!fs.existsSync(modPath)) {
    fs.writeFileSync(modPath, 'module.exports = {};');
  }
}

for (const pkg of packages) {
  for (const file of pkg.files) {
    const fullPath = path.join(pkg.dir, file.path);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(path.dirname(fullPath), { recursive: true });
      fs.writeFileSync(fullPath, file.content.trim() + '\n', 'utf8');
      console.log(`[setup-shared-stubs] Created: ${fullPath}`);
    }
  }
}

console.log('[setup-shared-stubs] All shared stubs verified and ready.');
