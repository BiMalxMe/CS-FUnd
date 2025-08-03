// Polyfills for Node.js modules in browser environment
import { Buffer } from 'buffer';

// Make Buffer available globally
(globalThis as any).Buffer = Buffer;

// Create a minimal process polyfill
(globalThis as any).process = {
  env: {},
  browser: true,
  version: '',
  versions: { node: '' },
  nextTick: (fn: Function) => setTimeout(fn, 0),
  cwd: () => '/',
  platform: 'browser',
  argv: [],
  pid: 1,
  title: 'browser',
  stderr: {},
  stdout: {},
  stdin: {},
};

// Ensure global is available
if (typeof global === 'undefined') {
  (globalThis as any).global = globalThis;
}

export {};