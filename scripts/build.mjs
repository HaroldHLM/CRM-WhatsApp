import { build } from 'esbuild';
import { cpSync, mkdirSync, rmSync } from 'node:fs';

const watch = process.argv.includes('--watch');
const outdir = 'dist';

rmSync(outdir, { recursive: true, force: true });
mkdirSync(`${outdir}/wa-js`, { recursive: true });

cpSync('public/manifest.json', `${outdir}/manifest.json`);
cpSync(
  'node_modules/@wppconnect/wa-js/dist/wppconnect-wa.js',
  `${outdir}/wa-js/wppconnect-wa.js`,
);
cpSync('node_modules/@wppconnect/wa-js/LICENSE', `${outdir}/wa-js/LICENSE`);

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
};

if (watch) {
  const { context } = await import('esbuild');
  const ctx = await context(options);
  await ctx.watch();
} else {
  await build(options);
}
