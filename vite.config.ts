import tailwindcss from '@tailwindcss/postcss';
import vinext from 'vinext';
import { defineConfig } from 'vite';
import { contactBuildConfig } from './lib/contact-build-config';

// Check branch isolation before export, so incomplete CI cannot produce a build.
contactBuildConfig(process.env);

// macOS Seatbelt blocks FSEvents, so Codex previews need polling for HMR.
const isCodexSeatbeltSandbox = process.env.CODEX_SANDBOX === 'seatbelt';

export default defineConfig({
  css: { postcss: { plugins: [tailwindcss()] } },
  server: isCodexSeatbeltSandbox
    ? { watch: { useFsEvents: false, usePolling: true } }
    : undefined,
  plugins: [vinext()],
});
