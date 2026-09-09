// PostToolUse hook: after Edit/Write touches a .java file, run a quick
// Maven compile so broken code is caught right away instead of at the next
// full test run. No-ops (silently) for any other file.
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
  if (!filePath || !filePath.endsWith('.java')) process.exit(0);

  const mvnw = path.join(
    process.cwd(),
    process.platform === 'win32' ? 'mvnw.cmd' : 'mvnw'
  );

  const result = spawnSync(mvnw, ['-q', '-DskipTests', 'compile'], {
    cwd: process.cwd(),
    stdio: 'inherit',
    shell: true,
  });

  process.exit(result.status === null ? 0 : result.status);
});
