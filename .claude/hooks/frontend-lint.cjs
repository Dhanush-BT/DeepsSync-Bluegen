// PostToolUse hook: after Edit/Write touches a frontend/ JS/JSX/TS/TSX file,
// run oxlint --fix on it so lint issues surface immediately instead of at
// `npm run build`. No-ops (silently) for any other file.
const { spawnSync } = require('child_process');
const path = require('path');

let input = '';
process.stdin.on('data', (chunk) => (input += chunk));
process.stdin.on('end', () => {
  let payload;
  try {
    payload = JSON.parse(input);
  } catch {
    process.exit(0);
  }

  const filePath =
    (payload.tool_response && payload.tool_response.filePath) ||
    (payload.tool_input && payload.tool_input.file_path);
  if (!filePath) process.exit(0);

  const normalized = filePath.replace(/\\/g, '/');
  const match = normalized.match(/\/frontend\/(.+\.(jsx?|tsx?))$/);
  if (!match) process.exit(0);

  const relativeToFrontend = match[1];
  const frontendDir = path.join(process.cwd(), 'frontend');

  const result = spawnSync('npx', ['oxlint', '--fix', relativeToFrontend], {
    cwd: frontendDir,
    stdio: 'inherit',
    shell: true,
  });

  process.exit(result.status === null ? 0 : result.status);
});
