import sani, { AND, NOT, OR, OBJECT } from "../../app/src/sanitizeAgainst"

/**
 * SA-32 — five sanitize() calls in one file crash the TypeScript compiler
 * ======================================================================
 *
 * This file is a FIXTURE, not a test. It is excluded from every build and
 * every tsconfig, because type-checking it does not fail — it aborts:
 *
 *     npx tsc --noEmit --target ES2020 --module ES2020 --moduleResolution node \
 *       --allowSyntheticDefaultImports --skipLibCheck --lib ES2022 \
 *       test/src/typeCrash.fixture.ts
 *
 *     RangeError: Maximum call stack size exceeded
 *
 * Verified on TypeScript 5.0.4 (the version in devDependencies) with the
 * default Node stack. There is no error code, no file, no line — just a
 * compiler stack trace, which is close to undiagnosable from a consumer's seat.
 *
 * No single pattern here is the culprit; each compiles fine on its own. The
 * conditional types (`Sanitized`, `ParseIfCombinator`, `DeepOBJECT`) are simply
 * expensive enough that inference across a handful of distinct call sites
 * exhausts the compiler's stack. Bisecting test/src/audit.ts put the threshold
 * at six un-erased call sites; this trimmed-down version reproduces with five.
 *
 * That threshold is what makes it worth fixing: five sanitizers is an ordinary
 * amount for one route file, so this is reachable by writing normal code, and
 * the only workaround is to erase the return type — which is exactly what
 * audit.ts's `build()` helper does, and what SA-23 says consumers end up doing
 * anyway.
 *
 * When SA-32 is fixed, the command above starts succeeding. Wire it into
 * `test:types` at that point, so it stays fixed.
 */

const shapes: [string, () => unknown][] = [
  ["happy path",    () => sani({ a: String })(JSON.parse('{"a":"x"}'))],
  ["union residue", () => sani(new OR({ a: String, b: Number }, { a: String }))(JSON.parse('{"a":"x"}'))],
  ["AND after NOT", () => sani(new AND(new NOT({ z: Number }), { a: String }))(JSON.parse('{"a":"x"}'))],
  ["soft OBJECT",   () => sani(new OBJECT(Number, true))(JSON.parse('{"good":1}'))],
  ["nested",        () => (sani({ n: { a: String } })(JSON.parse('{"n":{"a":"x"}}')) as any).n],
]

export default shapes
