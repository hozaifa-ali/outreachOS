const { spawn } = require('child_process');
const readline = require('readline');

// Terminal Colors
const colors = {
  reset: "\x1b[0m",
  cyan: "\x1b[36m",
  blue: "\x1b[34m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  magenta: "\x1b[35m",
  dim: "\x1b[2m",
  bold: "\x1b[1m"
};

const asciiArt = `
${colors.cyan}${colors.bold}
   ____        __                        __  __  __   ____  _____
  / __ \\__  __/ /_________  ____  _____/ /_ / / / /  / __ \\/ ___/
 / / / / / / / __/ ___/ _ \\/ __ \`/ ___/ __ \\ / / /  / / / /\\__ \\ 
/ /_/ / /_/ / /_/ /  /  __/ /_/ / /__/ / / // / /  / /_/ /___/ / 
\\____/\\__,_/\\__/_/   \\___/\\__,_/\\___/_/ /_//_/_/   \\____//____/  
${colors.reset}
${colors.dim}>>> INITIALIZING NEURAL NETWORK PROTOCOLS...${colors.reset}
`;

const steps = [
  { text: "[SYSTEM] Bypassing mainframe security...", time: 600, color: colors.blue },
  { text: "[SYSTEM] Synchronizing PostgreSQL persistent volume...", time: 800, color: colors.green },
  { text: "[SYSTEM] Booting ClickHouse analytical engines...", time: 700, color: colors.green },
  { text: "[SYSTEM] Establishing encrypted Redis pub/sub channels...", time: 500, color: colors.yellow },
  { text: "[NETWORK] Linking Anthropic Claude 3.5 synaptic pathways...", time: 900, color: colors.magenta },
  { text: "[TURBO] Igniting monorepo workspaces...", time: 400, color: colors.cyan }
];

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function typeWriter(text, color) {
  return new Promise(async (resolve) => {
    process.stdout.write(color);
    for (let i = 0; i < text.length; i++) {
      process.stdout.write(text[i]);
      await sleep(15 + Math.random() * 20); // typing effect speed
    }
    process.stdout.write(colors.reset + '\n');
    resolve();
  });
}

async function bootSequence() {
  console.clear();
  console.log(asciiArt);
  await sleep(1000);

  for (const step of steps) {
    await typeWriter(step.text, step.color);
    await sleep(step.time);
  }

  console.log(`\n${colors.green}${colors.bold}>>> ALL SYSTEMS ONLINE. INITIATING SERVER SEQUENCE... <<<${colors.reset}\n`);
  await sleep(1000);

  // Start actual turborepo dev
  const turbo = spawn('npx', ['turbo', 'run', 'dev', '--parallel'], {
    stdio: 'inherit',
    shell: true
  });

  turbo.on('close', (code) => {
    process.exit(code);
  });
}

bootSequence();
