// esbuild.config.mjs

import esbuild from 'esbuild';

const isWatch = process.argv.includes('--watch');

const buildOptions = {
  entryPoints: ['./src/main.ts'],
  bundle: true,
  outfile: './dist/main.js',
  platform: 'node',
  external: ['obsidian'],
  format: 'cjs', // CommonJS format
  sourcemap: false,
};

async function build() {
  const ctx = await esbuild.context(buildOptions);

  if (isWatch) {
    await ctx.watch();
    console.log('Watching for changes...');
  } else {
    await ctx.rebuild();
    await ctx.dispose();
  }
}

build().catch(() => process.exit(1));

