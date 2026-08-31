import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import commonJS from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'


const bundle = (input, file) => ({
  input,
  output: {
    file,
    format: 'cjs',
    sourcemap: true
  },
  plugins: [
    typescript({tsconfig: "./tsconfig.test.json", noEmitOnError: false, sourceMap: true}),
    resolve({modulesOnly: true, preferBuiltins: true}),
    commonJS({
      include: 'node_modules/**'
    }),
    json()
  ],
  // dont log errors
  onwarn: () => {}
})


export default [
  bundle('test/src/test.ts', 'test/dist/test.js'),
  // Audit findings. Named *.test.js so jest's default testMatch picks it up as
  // its own suite, runnable on its own with `npx jest audit`.
  bundle('test/src/audit.ts', 'test/dist/audit.test.js'),
]
