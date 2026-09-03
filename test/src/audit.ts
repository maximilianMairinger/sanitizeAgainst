import vm from "vm"
import sani, { AND, OR, NOT, AWAITED, OBJECT, CONST, ensure, matches, each, someEnsure,
  any, unknown, regex, numericRange, stringStartsWith, nonEmptyStringPattern,
  numberLikePattern, numberLikeStringPattern } from "../../app/src/sanitizeAgainst"
import pkg from "../../package.json"
import "./extend"


/**
 * Active audit findings
 * =====================
 *
 * One test per finding from the security audit. Every test asserts the
 * behaviour we WANT, so the ones describing unfixed bugs FAIL. That is the
 * point: the red list is the work queue, and it shrinks as findings are fixed.
 *
 *     npx jest audit          the work queue
 *     npm run test:lib        the library's own suite, which must stay green
 *     npm test                both
 *
 * Tests marked [GUARD] pass today. They pin behaviour that is correct and easy
 * to break by accident — see SA-27, where the obvious hardening for SA-10
 * silently removes the __proto__ protection. If a [GUARD] goes red, something
 * regressed; if anything else goes green, a finding is fixed and the test has
 * done its job.
 *
 * A handful of tests encode a *policy* choice rather than an unambiguous bug
 * (which of two defensible behaviours is right). Those are marked POLICY in a
 * comment; settle the policy first, then keep or rewrite the test.
 *
 * SA-23 (TypeScript output types) is compile-time only and lives in
 * test/src/typeGaps.ts. `npm run test:types` checks it.
 *
 * SA-02 and SA-29 are accepted for 1.x because changing the catch-all error
 * contract would be breaking. Their compatibility and deferred fail-closed
 * tests live together in test/src/errorSemantics.ts.
 */

/* ------------------------------------------------------------------ helpers */

/**
 * sanitize(), with its conditional return type erased.
 *
 * These tests assert runtime behaviour; the type-level story is SA-23's job and
 * lives in typeGaps.ts. Inferring `Sanitized<Pat>` across this many distinct
 * patterns in one file overflows the TypeScript compiler's own stack, so the
 * inference is deliberately cut here rather than worked around case by case.
 * (That overflow is itself worth a look — see the PR description.)
 */
const build = (pattern: unknown, errorMsg?: unknown): ((input?: any, errorMsg?: any) => any) =>
  (sani as any)(pattern, errorMsg)

/**
 * Runs `fn` and reports whether it threw, without a discriminated union —
 * the repo compiles with `strict: false`, where boolean-literal narrowing is
 * unreliable, so `ok` is a plain boolean and both fields are always readable.
 */
const attempt = <T>(fn: () => T): { ok: boolean, value?: T, error?: any } => {
  try { return { ok: true, value: fn() } } catch (error) { return { ok: false, error } }
}

/** Recursive merge of the kind found in lodash.merge, jQuery.extend, config loaders. */
const naiveMerge = (target: any, source: any) => {
  for (const key in source) {
    if (source[key] !== null && typeof source[key] === "object") {
      if (!target[key]) target[key] = {}
      naiveMerge(target[key], source[key])
    }
    else target[key] = source[key]
  }
  return target
}

/** Runs `fn` with Object.prototype polluted, and always cleans up. */
const withPollution = <T>(key: string, value: unknown, fn: () => T): T => {
  (Object.prototype as any)[key] = value
  try { return fn() }
  finally { delete (Object.prototype as any)[key] }
}

/** Always cleans up whatever `keys` a test may have leaked onto Object.prototype. */
const cleaningUp = <T>(keys: string[], fn: () => T): T => {
  try { return fn() }
  finally { for (const k of keys) delete (Object.prototype as any)[k] }
}

describe("audit findings", () => {

  /* =================================================================== *
   * SA-01  Aborted-branch residue is served as a valid result           *
   *                                                                     *
   * Root cause: in sanitizeRec's object branch (and in OBJECT.matches),  *
   * `knownInputObjects.set(input, out)` runs before `out` is populated.  *
   * A pattern that aborts midway leaves its half-built object in the     *
   * cache; the next pattern to see the same input gets a cache hit and   *
   * returns that object without validating anything.                     *
   * =================================================================== */
  describe("SA-01 aborted-branch residue", () => {

    test("SA-01a — a discriminated union keeps the matching member's fields", () => {
      const against = build(new OR(
        { kind: new CONST("comment"), body: String },
        { kind: new CONST("like") }
      ))
      expect(against(JSON.parse('{"kind":"like"}'))).eq({ kind: "like" })
    })

    test("SA-01b — a failed branch's defaults do not outrank the matching branch's", () => {
      const against = build(new OR(
        { isAdmin: true, mustFail: Number },   // aborts on mustFail
        { isAdmin: false }                     // the member that actually matches
      ))
      expect(against(JSON.parse("{}"))).eq({ isAdmin: false })
    })

    test("SA-01c — a property absent from the matching member is stripped", () => {
      const against = build(new OR({ a: String, b: String, c: String }, { a: String }))
      expect(against(JSON.parse('{"a":"x","b":"y"}'))).eq({ a: "x" })
    })

    test("SA-01d — AND(NOT(objectPattern), objectPattern) still enforces the second", () => {
      // "reject this shape, then enforce that shape". NOT runs its inner pattern,
      // which caches a half-built object before failing; the AND's next stage
      // then gets that cache hit.
      const against = build(new AND(new NOT({ a: Number }), { b: String }))
      expect(against(JSON.parse('{"b":"hi"}'))).eq({ b: "hi" })
    })

    test("SA-01e — deep OBJECT rejects a value that matches neither level", () => {
      // deep mode builds `new OR(valuePattern, this)` internally, inheriting the bug.
      const against = build(new OBJECT({ id: Number }, false, true))
      expect(() => against(JSON.parse('{"a":{"x":"str"}}'))).toThrow()
    })

    test("SA-01f — deep OBJECT keeps nested values that do match", () => {
      const against = build(new OBJECT({ id: Number }, false, true))
      expect(against(JSON.parse('{"a":{"nested":{"id":1}}}'))).eq({ a: { nested: { id: 1 } } })
    })

    test("SA-01g — the awaited OR path picks the member that matches", async () => {
      const against = build(new OR(new AWAITED({ x: String }), new AWAITED({ y: Number })))
      expect(await against(Promise.resolve({ y: 1 }) as any)).eq({ y: 1 })
    })

    test("SA-01h — output from a union always has Object.prototype", () => {
      // The closing Object.setPrototypeOf(out, Object.prototype) sits on the
      // success path only, so residue escapes with a null prototype and no
      // .toString / .hasOwnProperty.
      const out: any = build(new OR({ a: String, b: Number }, { a: String }))(
        JSON.parse('{"a":"x","b":"not a number"}')
      )
      expect(Object.getPrototypeOf(out)).toBe(Object.prototype)
    })

    test("SA-01i — a failed pattern node does not cache a partial result", () => {
      const branch = { a: String, b: Number }
      const against = build(new OR(branch, branch))

      expect(() => against(JSON.parse('{"a":"x","b":"not a number"}'))).toThrow()
    })
  })


  /* =================================================================== *
   * SA-03  Pass-through leaves preserve own __proto__                   *
   *                                                                     *
   * The __proto__ guard works by rebuilding output from pattern keys.    *
   * Leaves that return their input by reference skip that rebuild, so    *
   * JSON.parse's own __proto__ key survives into the caller's hands.     *
   *                                                                     *
   * POLICY: the fix is either to strip __proto__ from returned objects,  *
   * or to document that the guarantee only covers rebuilt values. These  *
   * tests assume the former.                                            *
   * =================================================================== */
  describe("SA-03 pass-through leaves", () => {

    const passThroughLeaves: [string, any][] = [
      ["any", any],
      ["unknown", unknown],
      ["Object", Object],
      ["NOT(Number)", new NOT(Number)],
    ]

    for (const [name, leaf] of passThroughLeaves) {
      test(`SA-03a — ${name} does not pass an own __proto__ key through`, () => {
        const out: any = build({ data: leaf })(JSON.parse('{"data":{"__proto__":{"role":"admin"},"ok":1}}'))
        expect(Object.prototype.hasOwnProperty.call(out.data, "__proto__")).toBe(false)
      })
    }

    test("SA-03a — a value nested under OBJECT(any) does not keep its own __proto__", () => {
      // OBJECT rebuilds its own key set, so the TOP level is clean (see the
      // guard below) — but each value goes through `any` untouched.
      const out: any = build(new OBJECT(any))(JSON.parse('{"a":{"__proto__":{"role":"admin"},"k":1}}'))
      expect(Object.prototype.hasOwnProperty.call(out.a, "__proto__")).toBe(false)
    })

    test("SA-03b — a sanitized value cannot pollute Object.prototype via a merge", () => cleaningUp(["sa03"], () => {
      const out: any = build({ data: any })(JSON.parse('{"data":{"__proto__":{"sa03":"polluted"}}}'))
      naiveMerge({}, out.data)
      expect(({} as any).sa03).toBeUndefined()
    }))

    test("SA-03c — someEnsure does not hand back raw elements", () => cleaningUp(["sa03b"], () => {
      const out: any = build(someEnsure(() => true))(JSON.parse('[{"__proto__":{"sa03b":"polluted"}}]'))
      naiveMerge({}, out[0])
      expect(({} as any).sa03b).toBeUndefined()
    }))

    test("SA-03d — the Object pattern rejects an array", () => {
      // Reads as "must be an object", accepts arrays and functions, and returns
      // the very same reference.
      expect(() => build({ settings: Object })(JSON.parse('{"settings":[1,2]}'))).toThrow()
    })

    // --- regression guard: this is the case that already works ---
    test("SA-03 [GUARD] a concrete nested pattern does strip __proto__", () => {
      const out: any = build({ data: { x: Number } })(
        JSON.parse('{"data":{"x":1,"__proto__":{"role":"admin"}}}')
      )
      expect(Object.prototype.hasOwnProperty.call(out.data, "__proto__")).toBe(false)
      expect(out.data).eq({ x: 1 })
    })
  })


  /* =================================================================== *
   * SA-04  A key-transforming key pattern walks past the guard          *
   *                                                                     *
   * OBJECT.matches tests out[key] (raw key) but writes to               *
   * out[this.saniKey(key)] (transformed key), moving the write out from  *
   * under its own guard.                                                *
   * =================================================================== */
  describe("SA-04 OBJECT key transform", () => {

    test("SA-04a — a lowercasing key pattern cannot install a prototype", () => {
      const against = build(new OBJECT(any, (k: string) => k.toLowerCase(), false))
      const out: any = against(JSON.parse('{"__PROTO__":{"role":"admin"},"role":"user"}'))

      expect(Object.getPrototypeOf(out)).toBe(Object.prototype)
      expect(out.role).toBe("user")
    })

    test("SA-04b — a prefix-stripping key pattern cannot install a prototype", () => {
      const against = build(new OBJECT(any, new AND(String, (k: string) => k.slice(5)), false))
      const out: any = against(JSON.parse('{"user___proto__":{"isAdmin":true},"user_name":"bob"}'))

      expect(out.isAdmin).toBeUndefined()
      expect(out).eq({ name: "bob" })
    })

    test("SA-04c — a key pattern producing __proto__ cannot null the prototype", () => {
      const against = build(new OBJECT(any, (k: string) => k.toLowerCase(), false))
      const out: any = against(JSON.parse('{"__PROTO__":null,"name":"bob"}'))
      expect(Object.getPrototypeOf(out)).toBe(Object.prototype)
    })

    // --- regression guard: the default key pattern is protected today ---
    test("SA-04 [GUARD] the identity key pattern blocks __proto__", () => {
      const out: any = build(new OBJECT(any))(JSON.parse('{"__proto__":{"role":"admin"},"name":"bob"}'))
      expect(out.role).toBeUndefined()
      expect(Object.getPrototypeOf(out)).toBe(Object.prototype)
    })
  })


  /* =================================================================== *
   * SA-05 / SA-20  The result cache ignores the pattern                 *
   *                                                                     *
   * knownInputObjects is keyed on the input object alone. A cycle is the *
   * same pattern revisiting an object; a second, different pattern       *
   * seeing it is not, but the cache cannot tell them apart.             *
   * =================================================================== */
  describe("SA-05 cache is not keyed on the pattern", () => {

    test("SA-05a — two patterns over one shared input are both enforced", () => {
      const shared = { role: "admin", extra: "leak" }
      const against = build({ a: new OBJECT(any), b: { role: new CONST("guest") } })
      expect(() => against({ a: shared, b: shared } as any)).toThrow()
    })

    test("SA-05b — one promise under two AWAITED patterns is checked twice", async () => {
      const p = Promise.resolve({ x: "s" })
      const against = build({
        one: new AWAITED({ x: String }),
        two: new AWAITED({ x: String, extra: Number })   // extra is required
      })
      const out: any = against({ one: p, two: p } as any)
      await expect(Promise.resolve(out.two)).rejects.toBeDefined()
    })

    test("SA-20 — a shared input reference does not produce one shared output object", () => {
      const shared = { x: "1" }
      const out: any = build({ a: { x: String }, b: { x: String } })({ a: shared, b: shared } as any)

      expect(out.a).not.toBe(out.b)
      out.a.x = "mutated"
      expect(out.b.x).toBe("1")
    })

    // --- regression guard: the cache's legitimate purpose must keep working ---
    test("SA-05 [GUARD] a recursive pattern terminates on a cyclic input", () => {
      // This is what knownInputObjects exists for: the same pattern revisiting
      // the same object. Any fix for SA-01/SA-05 has to keep this working.
      const input: any = { name: "root" }
      input.self = input

      const out: any = build(new OBJECT(String, false, true))(input)
      expect(out.name).toBe("root")
      expect(out.self).toBe(out)          // the cycle is reproduced, not expanded
    })
  })


  /* =================================================================== *
   * SA-06  A pattern loaded from JSON emits a pollution gadget          *
   * =================================================================== */
  test("SA-06 — a pattern key named __proto__ does not become an own property", () => cleaningUp(["sa06"], () => {
    // Object literals cannot express this (they set the prototype instead), so
    // it takes a schema built from JSON.parse, Object.create(null) or dynamic
    // keys — which is how schema-registry and multi-tenant setups build them.
    const pattern = JSON.parse('{"__proto__":{"sa06":"default"}}')
    const out: any = build(pattern)(JSON.parse('{"__proto__":{"sa06":"polluted"}}'))

    expect(Object.prototype.hasOwnProperty.call(out, "__proto__")).toBe(false)
    naiveMerge({}, out)
    expect(({} as any).sa06).toBeUndefined()
  }))


  /* =================================================================== *
   * SA-07  Existing pollution is copied into every new pattern          *
   *                                                                     *
   * Root cause: `for (const key in pattern)` walks inherited keys.       *
   * Object.keys would be equivalent for every legitimate pattern.        *
   * =================================================================== */
  describe("SA-07 patterns inherit prototype pollution", () => {

    test("SA-07a — a polluted Object.prototype does not add keys to the output", () =>
      withPollution("sa07", "injected", () => {
        const out = build({ a: String })(JSON.parse('{"a":"x"}'))
        expect(Object.keys(out as any)).eq(["a"])
      }))

    test("SA-07b — a polluted Object.prototype does not add a required key", () =>
      withPollution("sa07b", Number, () => {
        expect(build({ a: String })(JSON.parse('{"a":"x"}'))).eq({ a: "x" })
      }))

    test("SA-07c — a polluted Object.prototype does not break sanitize() itself", () =>
      withPollution("sa07c", undefined, () => {
        expect(() => build({ a: String })).not.toThrow()
      }))

    // --- regression guard: the read path already ignores inherited input keys ---
    test("SA-07 [GUARD] inherited input properties never reach the output", () => {
      const input = Object.create({ a: "from the prototype" })
      input.b = "own"
      expect(() => build({ a: String, b: String })(input)).toThrow()
    })
  })


  /* =================================================================== *
   * SA-08  CONST throws a string, so error decoration crashes           *
   * =================================================================== */
  describe("SA-08 CONST throws a non-Error", () => {

    const cases: [string, () => unknown][] = [
      ["inside an object pattern", () => build({ kind: new CONST("a") })(JSON.parse('{"kind":"b"}'))],
      ["with an errorMsg",         () => build(new CONST("a"), "context")("b")],
      ["inside each()",            () => build(each(new CONST("a")))(["b"])],
      ["bare",                     () => build(new CONST("a"))("b")],
    ]

    for (const [where, run] of cases) {
      test(`SA-08 — CONST fails with an Error ${where}`, () => {
        const r = attempt(run)
        expect(r.ok).toBe(false)
        if (r.ok) return
        expect(r.error).toBeInstanceOf(Error)
        expect(r.error).not.toBeInstanceOf(TypeError)
        expect(String(r.error.message)).toMatch(/a/)
      })
    }
  })


  /* =================================================================== *
   * SA-09  An unsupported pattern value fails cryptically               *
   * =================================================================== */
  describe("SA-09 unsupported pattern values", () => {

    const bad: [string, unknown][] = [
      ["undefined", undefined],
      ["null",      null],
      ["a symbol",  Symbol("nope")],
      ["a bigint",  BigInt(10)],
    ]

    for (const [name, value] of bad) {
      test(`SA-09 — ${name} as a pattern value names the problem`, () => {
        // Today: TypeError "Cannot read properties of undefined (reading
        // 'Symbol(fromInstance)')" — no mention of the pattern or the key.
        const r = attempt(() => build({ name: String, broken: value as any }))
        expect(r.ok).toBe(false)
        if (r.ok) return
        expect(String(r.error.message)).toMatch(/pattern|broken/i)
      })
    }
  })


  /* =================================================================== *
   * SA-10  OBJECT deletes keys named after Object.prototype members     *
   *                                                                     *
   * The guard is `if (out[key] !== undefined) continue` and `out` is a   *
   * plain object, so the check consults its prototype chain.             *
   * =================================================================== */
  test("SA-10 — OBJECT keeps keys that collide with Object.prototype", () => {
    const input = JSON.parse(
      '{"constructor":"c","toString":"t","valueOf":"v","hasOwnProperty":"h","isPrototypeOf":"i","normal":"n"}'
    )
    const out = build(new OBJECT(String))(input)
    expect(Object.keys(out as any).sort()).eq(Object.keys(input).sort())
  })


  /* =================================================================== *
   * SA-11  A `function` validator becomes an instanceof check           *
   *                                                                     *
   * isConstructor(f) is `f.prototype !== undefined`, true for every      *
   * function declaration and false for arrows, async functions, bound    *
   * functions and shorthand methods. The README only ever shows arrows.  *
   * =================================================================== */
  describe("SA-11 function-vs-constructor detection", () => {

    function fnValidator(x: any) {
      if (typeof x !== "string") throw new Error("not a string")
      return x
    }

    test("SA-11a — a function-declaration validator is called, not instanceof'd", () => {
      expect(build(fnValidator as any)("hi")).toBe("hi")
      expect(() => build(fnValidator as any)(42)).toThrow()
    })

    test("SA-11b — NOT of a function-declaration validator still rejects", () => {
      // The inner pattern can never match, so NOT accepts everything — a
      // validator that has quietly become a no-op.
      expect(() => build(new NOT(fnValidator as any))("hi")).toThrow()
    })

    // --- regression guard: classes must keep their instanceof semantics ---
    test("SA-11 [GUARD] a class pattern is still an instanceof check", () => {
      class Thing {}
      expect(build(Thing as any)(new Thing())).toBeInstanceOf(Thing)
      expect(() => build(Thing as any)({})).toThrow()
    })

    // --- regression guard: arrows must keep being called ---
    test("SA-11 [GUARD] an arrow validator is called", () => {
      expect(build(((x: any) => x + "!") as any)("hi")).toBe("hi!")
    })
  })


  /* =================================================================== *
   * SA-12  regex() does not enforce a string type                       *
   *                                                                     *
   * RegExp.prototype.test coerces, so non-strings match and are returned *
   * unchanged while the signature claims (input: string) => string.      *
   * =================================================================== */
  describe("SA-12 regex() type confusion", () => {

    const nonStrings: [string, unknown][] = [
      ["a number",   123],
      ["an array",   ["123"]],     // ?id[]=123 through any query parser
      ["an object",  { toString: () => "123" }],
    ]

    for (const [name, value] of nonStrings) {
      test(`SA-12 — regex() rejects ${name}`, () => {
        expect(() => build(regex(/^\d+$/))(value as any)).toThrow()
      })
    }

    // --- regression guard ---
    test("SA-12 [GUARD] regex() still accepts a matching string", () => {
      expect(build(regex(/^\d+$/))("123")).toBe("123")
      expect(() => build(regex(/^\d+$/))("12a")).toThrow()
    })
  })


  /* =================================================================== *
   * SA-13  each() skips array holes                                     *
   *                                                                     *
   * Array.prototype.map does not visit holes, so they are never          *
   * validated and survive into the output.                               *
   * =================================================================== */
  describe("SA-13 array holes", () => {

    test("SA-13a — each() validates holes", () => {
      const sparse = new Array(3)
      sparse[2] = "x"
      expect(() => build(each(String))(sparse)).toThrow()
    })

    test("SA-13b — each() applies a default to a hole", () => {
      const sparse = new Array(2)
      sparse[1] = 5
      expect(build(each(0))(sparse)).eq([0, 5])
    })

    test("SA-13c — each() output has no holes", () => {
      const sparse = new Array(2)
      sparse[1] = "x"
      const out = build(each(any))(sparse) as any[]
      expect(Object.keys(out).length).toBe(out.length)
    })
  })


  /* =================================================================== *
   * SA-14  Combinator instances are re-initialised, mutating at a       *
   *        distance                                                     *
   *                                                                     *
   * OBJECT.init memoises itself; Combinator.init does not. matches reads *
   * this.sanis at call time, so re-initialising rewrites validators that *
   * were already built.                                                 *
   * =================================================================== */
  describe("SA-14 shared combinator instances", () => {

    test("SA-14a — compiling a second validator does not change the first", () => {
      const shared = new OR(String)
      const against = build(shared)

      const before = attempt(() => against(5 as any)).ok
      shared.addPattern(Number)
      build(shared)                                  // an unrelated module compiles its own
      const after = attempt(() => against(5 as any)).ok

      expect(after).toBe(before)
    })

    test("SA-14b — addPattern either takes effect immediately or reports it cannot", () => {
      const shared = new OR(String)
      const against = build(shared)
      shared.addPattern(Number)
      // POLICY: pick one. Either the mutation applies to `against`, or
      // addPattern throws once the instance has been compiled.
      expect(attempt(() => against(5 as any)).ok).toBe(true)
    })
  })


  /* =================================================================== *
   * SA-15  A recursive pattern blows the stack at compile time          *
   *                                                                     *
   * knownPatternObjects.set(pattern, against) runs after the recursive   *
   * descent, so the cache that exists to handle pattern cycles never     *
   * gets the chance to. Same reordering as SA-01, other cache.           *
   * =================================================================== */
  describe("SA-15 recursive patterns", () => {

    test("SA-15a — a self-referential pattern compiles", () => {
      const pattern: any = { name: String }
      pattern.self = pattern
      expect(() => build(pattern)).not.toThrow()
    })

    test("SA-15b — mutually recursive patterns compile", () => {
      const a: any = { name: String }
      const b: any = { a }
      a.b = b
      expect(() => build(a)).not.toThrow()
    })
  })


  /* =================================================================== *
   * SA-16  numberLike* inherits every quirk of unary +                  *
   *                                                                     *
   * POLICY: `!isNaN(+input)` is far broader than "looks like a number".  *
   * If any of these are wanted, delete the row rather than the test.     *
   * =================================================================== */
  describe("SA-16 numberLike coercion breadth", () => {

    const shouldReject = [
      "0x1f", "0b101", "0o17",        // alternative radices
      "Infinity", "-Infinity",        // not finite
      "1e400",                        // overflows to Infinity
      "   ", "\n\t",                  // whitespace only, coerces to 0
      "  12  ",                       // padded
    ]

    for (const input of shouldReject) {
      test(`SA-16a — numberLikePattern rejects ${JSON.stringify(input)}`, () => {
        expect(() => build(numberLikePattern)(input)).toThrow()
      })
    }

    test("SA-16b — numberLikePattern only ever yields a finite number", () => {
      for (const input of ["Infinity", "-Infinity", "1e400"]) {
        const r = attempt(() => build(numberLikePattern)(input))
        if (r.ok) expect(Number.isFinite(r.value)).toBe(true)
      }
    })

    // --- regression guard ---
    test("SA-16 [GUARD] ordinary numberlike values still pass", () => {
      expect(build(numberLikePattern)("12")).toBe(12)
      expect(build(numberLikePattern)(12)).toBe(12)
      expect(build(numberLikePattern)("-1.5")).toBe(-1.5)
      expect(() => build(numberLikePattern)("")).toThrow()
      expect(() => build(numberLikePattern)("abc")).toThrow()
    })
  })


  /* =================================================================== *
   * SA-17  regex() writes to the RegExp the caller handed it            *
   * =================================================================== */
  test("SA-17 — regex() does not mutate the caller's RegExp", () => {
    const shared = /a/g
    shared.lastIndex = 7
    build(regex(shared))("aaaa")
    expect(shared.lastIndex).toBe(7)
  })


  /* =================================================================== *
   * SA-18  Helpers raise TypeError where a validation error belongs     *
   *                                                                     *
   * Fail-closed, but an app that maps validation errors to 400 and       *
   * everything else to 500 returns the wrong status for a bad request.   *
   * =================================================================== */
  describe("SA-18 crash instead of validation error", () => {

    const cases: [string, () => unknown][] = [
      ["stringStartsWith on a number", () => build({ p: stringStartsWith("a") })({ p: 5 } as any)],
      ["stringStartsWith on null",     () => build({ p: stringStartsWith("a") })({ p: null } as any)],
    ]

    // --- regression guard: the patterns that already report properly ---
    test("SA-18 [GUARD] type-checked helpers give a validation error, not a crash", () => {
      for (const run of [
        () => build({ p: nonEmptyStringPattern })({ p: {} } as any),
        () => build({ p: numericRange(0, 10) })({ p: "x" } as any),
      ]) {
        const r = attempt(run)
        expect(r.ok).toBe(false)
        expect(r.error).not.toBeInstanceOf(TypeError)
      }
    })

    for (const [name, run] of cases) {
      test(`SA-18 — ${name} is a validation error`, () => {
        const r = attempt(run)
        expect(r.ok).toBe(false)
        if (r.ok) return
        expect(r.error).not.toBeInstanceOf(TypeError)
      })
    }
  })


  /* =================================================================== *
   * SA-19  Realm-bound and constructor-identity checks                  *
   * =================================================================== */
  describe("SA-19 realm and prototype identity", () => {

    test("SA-19a — AWAITED accepts a thenable", async () => {
      const thenable = { then(resolve: (v: unknown) => void) { resolve("hi") } }
      expect(await build(new AWAITED(String))(thenable as any)).toBe("hi")
    })

    test("SA-19b — a cross-realm plain object is accepted", () => {
      const context = vm.createContext({})
      const foreign = vm.runInContext('({a: "b"})', context)
      expect(build({ a: String })(foreign)).eq({ a: "b" })
    })

    test("SA-19c — a cross-realm array is accepted by each()", () => {
      const context = vm.createContext({})
      const foreign = vm.runInContext('["a","b"]', context)
      expect(build(each(String))(foreign)).eq(["a", "b"])
    })

    test("SA-19d — a spoofed prototype does not smuggle inherited keys in", () => {
      // The plain-object check is a constructor-identity check, not a
      // prototype-identity check, so this passes it — and OBJECT's for..in
      // then copies the inherited enumerable keys.
      const input = Object.create({ constructor: Object, isAdmin: true, role: "admin" })
      input.name = "bob"
      const out: any = build(new OBJECT(any))(input)
      expect(out).eq({ name: "bob" })
    })
  })


  /* =================================================================== *
   * SA-21  AND is a pipeline, documented as an intersection             *
   *                                                                     *
   * The pipeline behaviour is the useful one and the examples rely on    *
   * it. This is a regression guard pinning the semantics so the README   *
   * can be corrected to match, not a request to change the code.        *
   * =================================================================== */
  describe("SA-21 AND semantics (guard, not a bug)", () => {

    test("SA-21 [GUARD] each stage receives the previous stage's output", () => {
      expect(build(new AND(Number, (n: any) => n + 1))(1)).toBe(2)
    })

    test("SA-21 [GUARD] so an intersection of two object patterns cannot succeed", () => {
      // Stage 1 strips `b` before stage 2 can require it. Documented as
      // "passes if all of them pass", which reads as an intersection.
      expect(() => build(new AND({ a: String }, { b: Number }))(JSON.parse('{"a":"x","b":1}'))).toThrow()
    })
  })


  /* =================================================================== *
   * SA-22  {a, "a?"} silently means required AND optional               *
   * =================================================================== */
  test("SA-22 — a key declared both required and optional is reported", () => {
    // POLICY: today both run and the optional one overwrites, so a valid
    // string fails with "Input is not a number". Rejecting at compile time is
    // the assumption here; the alternative is a documented precedence rule.
    expect(() => build({ a: String, "a?": Number })).toThrow(/a/)
  })


  /* =================================================================== *
   * SA-24  The documented call style does not work                      *
   * =================================================================== */
  describe("SA-24 README/API mismatch", () => {

    test("SA-24 — combinators are callable without new, as the README shows", () => {
      // POLICY: either add function wrappers, or fix the README. This test
      // assumes wrappers; delete it if the docs are the thing that changes.
      expect(() => (OR as any)(Number, String)).not.toThrow()
      expect(() => (AND as any)(Number)).not.toThrow()
      expect(() => (NOT as any)(Number)).not.toThrow()
    })
  })


  /* =================================================================== *
   * SA-25  Packaging is deny-by-omission                               *
   *                                                                     *
   * .npmignore ships anything left in the working directory — 1.8.0     *
   * shipped a stray local note. A "files" allowlist inverts that.        *
   * =================================================================== */
  test("SA-25 — package.json declares a files allowlist", () => {
    expect(Array.isArray((pkg as any).files)).toBe(true)
  })


  /* =================================================================== *
   * NEAR MISSES — not exploitable as the code stands.                   *
   * Each is one plausible patch away from becoming one of the above.     *
   * =================================================================== */
  describe("near misses", () => {

    /* --- SA-26  async cache state is nulled rather than restored ------- *
     * AWAITED.matches saves knownInputObjects, restores it inside the
     * then, then assigns null instead of the saved value; OR's awaited
     * path does not restore at all when every member fails. Nothing
     * currently reads it on a path that does not write it first, so this
     * is a guard: it passes today and must keep passing.               */
    test("SA-26 [GUARD] interleaved async sanitizations do not contaminate each other", async () => {
      const jobs: Promise<void>[] = []
      for (let i = 0; i < 200; i++) {
        const against = build({ id: Number, tag: new AWAITED(String) })
        const input = { id: i, tag: Promise.resolve(`tag-${i}`) }
        jobs.push((async () => {
          const out: any = against(input as any)
          expect(out.id).toBe(i)
          expect(await out.tag).toBe(`tag-${i}`)
        })())
      }
      await Promise.all(jobs)
    })

    test("SA-26 [GUARD] a rejected AWAITED does not disturb a later sanitization", async () => {
      const failing = build({ v: new AWAITED(String) })
      await expect(Promise.resolve((failing({ v: Promise.resolve(123) } as any) as any).v))
        .rejects.toBeDefined()
      expect(build({ b: Number })({ b: 1 })).eq({ b: 1 })
    })

    /* --- SA-27  the guard depends on the inheritance it guards against - *
     * OBJECT's `out[key] !== undefined` only catches __proto__ and
     * friends because `out` is {} and inherits them. Hardening it to
     * Object.create(null) — the obvious change, and the one the object
     * pattern branch already makes — silently removes the guard.
     * If SA-10 is fixed by switching to a null-prototype object, THIS
     * test is what catches the regression.                             */
    test("SA-27 [GUARD] OBJECT blocks every dangerous key name", () => {
      const dangerous = ["__proto__", "constructor", "prototype"]
      for (const key of dangerous) {
        const out: any = build(new OBJECT(any))(JSON.parse(`{${JSON.stringify(key)}:{"role":"admin"}}`))
        expect(Object.getPrototypeOf(out)).toBe(Object.prototype)
        expect(out.role).toBeUndefined()
        expect(({} as any).role).toBeUndefined()
      }
    })

    /* --- SA-28  every property is read twice -------------------------- */
    test("SA-28 — an input property is read exactly once", () => {
      let reads = 0
      const input = { get a() { reads++; return "x" } }
      build({ a: String })(input as any)
      expect(reads).toBe(1)
    })

    /* --- SA-30  attacker code runs while formatting errors ------------ */
    test("SA-30 — formatting a validation error does not call the input's toString", () => {
      const evil = { toString() { throw new Error("code ran during error formatting") } }
      const r = attempt(() => build(new CONST("user"))(evil as any))
      expect(r.ok).toBe(false)
      if (r.ok) return
      expect(String(r.error && r.error.message || r.error)).not.toMatch(/code ran/)
    })

    /* --- SA-31  the output prototype is repaired last, not set first --- *
     * Every early exit therefore yields a null-prototype object. A broad
     * net, so any new early-exit path is caught too.                   */
    test("SA-31 — every returned object has Object.prototype, on every exit path", () => {
      const shapes: [string, () => unknown][] = [
        ["happy path",     () => build({ a: String })(JSON.parse('{"a":"x"}'))],
        ["union residue",  () => build(new OR({ a: String, b: Number }, { a: String }))(JSON.parse('{"a":"x","b":"no"}'))],
        ["AND after NOT",  () => build(new AND(new NOT({ z: Number }), { a: String }))(JSON.parse('{"a":"x"}'))],
        ["soft OBJECT",    () => build(new OBJECT(Number, true))(JSON.parse('{"good":1,"bad":"x"}'))],
        ["nested",         () => (build({ n: { a: String } })(JSON.parse('{"n":{"a":"x"}}')) as any).n],
      ]
      for (const [name, run] of shapes) {
        const r = attempt(run)
        if (!r.ok) continue
        expect([name, Object.getPrototypeOf(r.value) === Object.prototype]).eq([name, true])
      }
    })
  })
})
