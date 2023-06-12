import { merge } from "webpack-merge"
import commonMod from "./rollup.node.common.config.mjs"


export default merge(commonMod, {
  input: 'app/src/sanitizeAgainst.ts',
  output: {
    file: 'app/dist/cjs/sanitizeAgainst.js',
    format: 'cjs'
  },
})