const { execSync } = require('child_process');

let data = '';
process.stdin.on('data', (c) => (data += c));
process.stdin.on('end', () => {
  let filePath = '';
  try {
    const j = JSON.parse(data);
    filePath = j.tool_input?.file_path || j.tool_response?.filePath || '';
  } catch {
    process.exit(0);
  }

  if (!/\.(ts|tsx)$/.test(filePath)) {
    process.exit(0);
  }

  try {
    execSync('npx tsc --noEmit -p tsconfig.json', {
      cwd: process.cwd(),
      stdio: 'pipe',
      timeout: 90000,
    });
    process.exit(0);
  } catch (e) {
    const out = (e.stdout?.toString() || '') + (e.stderr?.toString() || '');
    const trimmed = out.split('\n').slice(0, 40).join('\n');
    console.log(
      JSON.stringify({
        systemMessage: 'TypeScript errors after edit to ' + filePath + ':\n' + trimmed,
        hookSpecificOutput: {
          hookEventName: 'PostToolUse',
          additionalContext:
            'tsc --noEmit reported errors after this edit:\n' + trimmed,
        },
      })
    );
    process.exit(2);
  }
});
