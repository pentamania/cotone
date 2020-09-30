import replace from '@rollup/plugin-replace'
import typescript from 'rollup-plugin-typescript2'
import { terser } from 'rollup-plugin-terser'
import license from 'rollup-plugin-license'
import {
  name,
  version,
  license as LICENSE,
  author,
  dependencies,
} from './package.json'

// Config
const noDeclarationFiles = { compilerOptions: { declaration: false } }
const externals = dependencies ? Object.keys(dependencies) : []

const banner = `/*!
 * ${name} v${version}
 * ${LICENSE} Licensed
 *
 * Copyright (C) ${author}
 */`

export default [
  // commonJS
  {
    input: 'src/index.ts',
    output: {
      file: `lib/${name}.js`,
      format: 'cjs',
    },
    external: externals,
    plugins: [
      typescript({ useTsconfigDeclarationDir: true }),
      license({ banner: banner }),
    ],
  },

  // esm
  {
    input: 'src/index.ts',
    output: {
      file: `lib/${name}.esm.js`,
      format: 'esm',
    },
    external: externals,
    plugins: [
      typescript({ tsconfigOverride: noDeclarationFiles }),
      license({ banner: banner }),
    ],
  },

  // UMD Dev
  {
    input: 'src/index.ts',
    output: {
      file: `dist/${name}.js`,
      format: 'umd',
      name: `${name}`,
    },
    external: externals,
    plugins: [
      typescript({ tsconfigOverride: noDeclarationFiles }),
      replace({
        'process.env.NODE_ENV': JSON.stringify('development'),
      }),
      license({ banner: banner }),
    ],
  },

  // UMD Prod
  {
    input: 'src/index.ts',
    output: {
      file: `dist/${name}.min.js`,
      format: 'umd',
      name: `${name}`,
    },
    external: externals,
    plugins: [
      typescript({ tsconfigOverride: noDeclarationFiles }),
      replace({
        'process.env.NODE_ENV': JSON.stringify('production'),
      }),
      terser({
        compress: {
          pure_getters: true,
          unsafe: true,
          unsafe_comps: true,
          warnings: false,
        },
      }),
      license({ banner: banner }),
    ],
  },
]
