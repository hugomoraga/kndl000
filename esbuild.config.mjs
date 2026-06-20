import { build } from 'esbuild';

const common = {
  entryPoints: ['src/index.js'],
  bundle: true,
  sourcemap: true,
  target: ['es2022'],
  external: ['p5']
};

await build({
  ...common,
  outfile: 'dist/index.mjs',
  format: 'esm'
});

await build({
  ...common,
  outfile: 'dist/index.cjs',
  format: 'cjs',
  platform: 'neutral'
});

console.log('Built dist/index.mjs and dist/index.cjs');
