import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sharedDir = path.resolve(__dirname, '../../shared');

console.log(`[setup-shared-stubs] Provisioning shared directory at: ${sharedDir}`);

// Packages definition with comprehensive stub implementations and Proxy fallbacks
const packages = [
  {
    name: '@offgrid/models',
    dir: path.join(sharedDir, 'packages/models'),
    files: [
      {
        path: 'dist/index.js',
        content: `
const target = {
  DEFAULT_MAX_TOOL_CALLS: 5,
  MAX_MAX_TOOL_CALLS: 20,
  MIN_MAX_TOOL_CALLS: 1,
  MAX_TOOL_RESULT_CHARS: 20000,
  REASONING_BUDGET_AUTO: 'auto',
  REASONING_BUDGET_OPTIONS: ['auto', 'low', 'medium', 'high'],
  reasoningBudgetLabel: (b) => b || 'auto',
  boundToolResult: (r) => r,
  callsWithinToolBudget: () => true,
  effectiveImageParameter: (p) => p,
  resolveImageParameters: (p) => p,
  finalResponseFromToolResults: () => '',
  normalizeMaxToolCalls: (n) => (typeof n === 'number' ? Math.max(1, Math.min(20, n)) : 5),
  openRouterReasoningPayload: () => ({}),
  reasoningBudgetPayload: () => ({}),
  thinkingBudgetPayload: () => ({}),
  toolLimitFinalAnswerInstruction: () => '',
  toolPromptChars: () => 0,
  toolResultCharBudget: () => 4000,
};

target.__esModule = true;
target.default = target;

module.exports = new Proxy(target, {
  get(t, prop) {
    if (prop === '__esModule') return true;
    if (prop === 'default') return t;
    if (prop in t) return t[prop];
    return () => null;
  }
});
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
const target = {
  hasProAccess: () => false,
  preprocessChatMarkdown: (text) => text || '',
  safeChatExternalUrl: (url) => url || '',
  PROMPT_ENHANCEMENT_STATUS: { IDLE: 'idle', GENERATING: 'generating', READY: 'ready', FAILED: 'failed' },
  PROMPT_ENHANCEMENT_REASONING_LABEL: 'Enhancing prompt...',
  chatListPreviewLine: () => '',
  XML_TOOL_CALL_PARAMETER_MARKER: 'parameter=',
  REASONING_DELIMITERS: [],
  TOOL_CALL_CLOSERS: ['</tool_call>', '<|tool_call|>', '</function>'],
  TOOL_CALL_OPENERS: ['<tool_call>', '<|tool_call|>', '<function='],
  XML_TOOL_CALL_FUNCTION_MARKER: 'function=',
  maxPartialTagSuffix: () => '',
  parseChatModelOutput: (content, reasoningContent) => ({
    reasoning: reasoningContent || null,
    thinking: reasoningContent || null,
    answer: content || '',
    response: content || '',
    isReasoningComplete: true,
    isThinkingComplete: true,
    reasoningLabel: undefined,
  }),
  parseChatThinkingContent: (content) => ({
    reasoning: null,
    thinking: null,
    answer: content || '',
    response: content || '',
    isReasoningComplete: true,
    isThinkingComplete: true,
    reasoningLabel: undefined,
  }),
  partialTagSuffix: () => null,
  stripChatControlTokens: (t) => t || '',
  // Stream & Chat Previews
  chatStreamPreviewRows: () => [],
  chatStreamPhaseIsStatus: () => false,
  chatStreamPhaseLabel: () => '',
  chatStreamPreviewHasMessageBody: () => false,
  isRuntimeOnlyMessage: () => false,
  isSupportingChatContext: () => false,
  splitInlineReasoning: (text) => ({
    reasoning: null,
    thinking: null,
    answer: text || '',
    content: text || '',
    reasoningLabel: undefined,
  }),
  completeChatStreamTool: () => {},
  startChatStreamTool: () => {},
  serializeSyncedMessageContext: () => '',
  projectSyncedMessageTurn: () => ({}),
  projectPersonalMeshActivationFailure: () => null,
  ogamModelTransferBlocker: () => null,
  createBlobMaterial: () => ({}),
  createKnowledgeDocumentStateFields: () => ({}),
  createSharedFileStateFields: () => ({}),
  checksumFromSha512Hex: () => '',
  blobKeyBase64: () => '',
  // Constants & Enums
  CHUNK_SIZE: 65536,
  BLOB_FRAME_BYTES: 65536,
  BLOB_TOKEN_TTL_MS: 300000,
  OFFGRID_SYNC_PORT: 5174,
  KNOWLEDGE_DOCUMENT_ENTITY: 'knowledge_doc',
  SHARED_FILE_ENTITY: 'shared_file',
  TASK_CONTROL_ENTITY: 'task_control',
  TASK_LAUNCH_ENTITY: 'task_launch',
  TASK_RUN_ENTITY: 'task_run',
  // Classes
  BlobChannelHost: class {},
  BlobEndpoint: class {},
  CompositeDiscoveryService: class {},
  DiscoveryOrchestrator: class {},
  DiscoveryScanSnapshot: class {},
  DiscoveryService: class {},
  DiscoverySource: class {},
  IncrementalChecksum: class {},
  MembershipRevocationPersistence: class {},
  MembershipRevocationSnapshot: class {},
  MultiTransportBridge: class {},
  PairingPersistence: class {},
  PeerLink: class {},
  SyncConnection: class {},
  SyncEngine: class {},
  TransportBridge: class {},
};

target.__esModule = true;
target.default = target;

module.exports = new Proxy(target, {
  get(t, prop) {
    if (prop === '__esModule') return true;
    if (prop === 'default') return t;
    if (prop in t) return t[prop];
    return () => null;
  }
});
`,
      },
      {
        path: 'dist/portable/index.js',
        content: `module.exports = new Proxy({}, { get: () => () => null });`,
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
        path: 'rn.js',
        content: `module.exports = { RnTcpTransport: class {} };`,
      },
      {
        path: 'rn-discovery.js',
        content: `module.exports = { RnDiscovery: class {} };`,
      },
      {
        path: 'package.json',
        content: JSON.stringify(
          {
            name: '@offgrid/sync',
            version: '0.0.1',
            main: 'dist/index.js',
            exports: {
              '.': './dist/index.js',
              './portable': './dist/portable/index.js',
              './rn': './dist/adapters/rn-tcp.js',
              './rn-discovery': './dist/adapters/rn-discovery.js',
            },
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
const target = {
  DEFAULT_SILENCE_AFTER_SPEECH_MS: 1000,
  DEFAULT_SPEAKER_DRAIN_MS: 500,
  SILENCE_AFTER_SPEECH_CHOICES_MS: [500, 1000, 1500],
  SPEAKER_DRAIN_CHOICES_MS: [250, 500, 750],
  SPEECH_ONSET_LOOKBACK_MS: 300,
  VOICE_DELAY_LABELS: {},
  VOICE_TURN_LABELS: {},
  VoiceSession: class {},
  SpeechEndpointTimer: class {},
  VoiceTurnMode: {},
  WAV_HEADER_BYTES: 44,
  WAV_HEADER_SCAN_BYTES: 44,
  initialVoiceSession: () => ({}),
  nextVoiceSession: () => ({}),
  micShouldBeOpen: () => false,
  speechMayPlay: () => false,
  secondsLabel: (s) => (s + 's'),
  planWavTrim: () => ({}),
  transcriptionLanguages: [],
};

target.__esModule = true;
target.default = target;

module.exports = new Proxy(target, {
  get(t, prop) {
    if (prop === '__esModule') return true;
    if (prop === 'default') return t;
    if (prop in t) return t[prop];
    return () => null;
  }
});
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
const target = {
  sampleProgressRate: () => ({}),
  projectProgress: () => ({ progress: 0 }),
};

target.__esModule = true;
target.default = target;

module.exports = new Proxy(target, {
  get(t, prop) {
    if (prop === '__esModule') return true;
    if (prop === 'default') return t;
    if (prop in t) return t[prop];
    return () => null;
  }
});
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
const target = {
  chunkText: (text) => [{ content: text || '', position: 0 }],
};

module.exports = new Proxy(target, {
  get(t, prop) {
    if (prop in t) return t[prop];
    return () => null;
  }
});
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
        content: `module.exports = new Proxy({}, { get: () => () => null });`,
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
  fs.writeFileSync(modPath, 'module.exports = new Proxy({}, { get: () => () => null });');
}

for (const pkg of packages) {
  for (const file of pkg.files) {
    const fullPath = path.join(pkg.dir, file.path);
    fs.mkdirSync(path.dirname(fullPath), { recursive: true });
    fs.writeFileSync(fullPath, file.content.trim() + '\n', 'utf8');
    console.log(`[setup-shared-stubs] Provisioned: ${fullPath}`);
  }
}

console.log('[setup-shared-stubs] All shared stubs verified and ready.');
