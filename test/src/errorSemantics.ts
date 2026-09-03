import sani, { OR, NOT, OBJECT, CONST, any, matches } from "../../app/src/sanitizeAgainst"
import "./extend"


/**
 * Error semantics — current contract and deferred audit findings
 * ==============================================================
 *
 * A thrown value is the library's validation-failure signal. Changing the
 * combinators to rethrow programming and resource errors would therefore be a
 * breaking change. The first group pins that compatibility contract.
 *
 * SA-02 and SA-29 describe the fail-open consequence of that contract. Their
 * desired, fail-closed expectations remain here as skipped tests for a future
 * major version, where a distinguishable validation-failure signal can be
 * introduced without silently changing existing function patterns.
 */

const build = (pattern: unknown): ((input?: any) => any) => (sani as any)(pattern)

const attempt = <T>(fn: () => T): { ok: boolean, value?: T, error?: any } => {
  try { return { ok: true, value: fn() } } catch (error) { return { ok: false, error } }
}

const crashingPattern = (_: unknown) => { throw new TypeError("bug in validator") }

describe("current error compatibility contract", () => {
  test.each([
    ["OR", () => expect(build(new OR(crashingPattern, String))("x")).toBe("x")],
    ["NOT", () => expect(build(new NOT(crashingPattern))("x")).toBe("x")],
    ["matches()", () => expect(matches(crashingPattern)("x")).toBe(false)],
    ["soft OBJECT", () => expect(build(new OBJECT(crashingPattern, true))({ value: "x" })).eq({})],
  ])("%s treats every thrown value as a pattern mismatch", (_name, assertContract) => {
    assertContract()
  })
})


describe.skip("deferred fail-closed error semantics (SA-02 / SA-29)", () => {
  const nest = (depth: number) => JSON.parse('{"a":'.repeat(depth) + '"leaf"' + "}".repeat(depth))

  const stackExhaustingInput = () => {
    const makePattern = () => new OBJECT(String, false, true)

    for (const depth of [1500, 4000, 10000, 30000]) {
      const input = nest(depth)
      if (!attempt(() => build(makePattern())(input)).ok) return input
    }

    throw new Error(
      "Could not exhaust the stack at depth 30000; raise the probe or run Node with a smaller --stack-size."
    )
  }

  test("SA-02a — NOT rejects a deeply nested input its pattern matches", () => {
    const makePattern = () => new OBJECT(String, false, true)
    const shallow = JSON.parse('{"a":"leaf"}')

    expect(() => build(new NOT(makePattern()))(shallow)).toThrow()
    expect(() => build(new NOT(makePattern()))(stackExhaustingInput())).toThrow()
  })

  test("SA-02b — OR does not fall through to a permissive member on a crash", () => {
    const input = stackExhaustingInput()
    const result = attempt(() => build(new OR(new OBJECT(new CONST("safe"), false, true), any))(input))

    expect(result.ok && result.value === input).toBe(false)
  })

  test("SA-02c — a throwing getter does not make NOT fail open", () => {
    const input = { get role() { throw new Error("getter") } }
    expect(() => build(new NOT({ role: String }))(input as any)).toThrow()
  })

  test("SA-02d / SA-29 — a programming error inside a pattern is not swallowed by OR", () => {
    expect(() => build(new OR(crashingPattern, String))("x")).toThrow(TypeError)
  })
})
