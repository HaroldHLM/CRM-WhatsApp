import { build, context } from 'esbuild';
import { cpSync, mkdirSync, rmSync } from 'node:fs';

const watch = process.argv.includes('--watch');
const outdir = 'dist';

/**
 * Copia opcional del build a otra carpeta (CRM_COPY_TO).
 * Útil en WSL: Chrome corre en Windows y carga mejor la extensión desde
 * una carpeta de Windows, p. ej. CRM_COPY_TO=/mnt/c/crm-whatsapp-dev
 */
const copyTo = process.env.CRM_COPY_TO?.trim();

rmSync(outdir, { recursive: true, force: true });
mkdirSync(`${outdir}/wa-js`, { recursive: true });

cpSync('public/manifest.json', `${outdir}/manifest.json`);
cpSync('node_modules/@wppconnect/wa-js/dist/wppconnect-wa.js', `${outdir}/wa-js/wppconnect-wa.js`);
cpSync('node_modules/@wppconnect/wa-js/LICENSE', `${outdir}/wa-js/LICENSE`);

function copyBuild() {
  if (!copyTo) return;
  mkdirSync(copyTo, { recursive: true });
  cpSync(outdir, copyTo, { recursive: true, force: true });
  console.log(`  copiado a ${copyTo}`);
}

const copyPlugin = {
  name: 'copy-build',
  setup(b) {
    b.onEnd((result) => {
      if (result.errors.length === 0) copyBuild();
    });
  },
};

const options = {
  entryPoints: { bridge: 'src/bridge/main.ts', content: 'src/content/main.tsx' },
  outdir,
  bundle: true,
  format: 'iife',
  target: 'chrome114',
  jsx: 'automatic',
  minify: !watch,
  sourcemap: watch ? 'inline' : false,
  define: { 'process.env.NODE_ENV': JSON.stringify(watch ? 'development' : 'production') },
  logLevel: 'info',
  plugins: [copyPlugin],
};

if (watch) {
  const ctx = await context(options);
  await ctx.watch();
} else {
  await build(options);
}
