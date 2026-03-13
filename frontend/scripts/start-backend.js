/**
 * Inicia o backend com cwd = pasta backend (PORT=3000).
 * Usa "npm run dev:server" para o npm resolver ts-node-dev no backend.
 */
const path = require("path");
const { spawn } = require("child_process");

const backendDir = path.resolve(__dirname, "..", "..", "backend");

const child = spawn("npm", ["run", "dev:server"], {
  cwd: backendDir,
  stdio: "inherit",
  env: { ...process.env, PORT: "3000" },
  shell: true,
});

child.on("error", (err) => {
  console.error("Erro ao iniciar backend:", err);
  process.exit(1);
});
child.on("exit", (code) => {
  process.exit(code ?? 1);
});
