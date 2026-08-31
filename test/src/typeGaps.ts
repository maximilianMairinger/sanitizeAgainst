import sani, { AND, OR, CONST } from "../../app/dist/esm/sanitizeAgainst"

/**
 * SA-23 — type-level gaps
 * =======================
 *
 * Compile-time counterpart to test/src/audit.ts. There is nothing to run; the
 * check is whether this file type-checks.
 *
 *     npm run test:types
 *
 * Every gap is marked with `@ts-expect-error`, so:
 *
 *   - today the file compiles cleanly, because each error it expects is there;
 *   - when a gap is fixed the error disappears, TypeScript reports
 *     "Unused '@ts-expect-error' directive", and the check goes red — telling
 *     you to delete the directive and strike the gap off the list.
 *
 * Same red/green flip as gap() in audit.ts, one layer down.
 *
 *
 * The gap, in one sentence
 * -----------------------
 * An object pattern's output type has no accessible properties, so the only
 * workable response is `as any` on the sanitizer's result — which discards the
 * type-level guarantee at exactly the boundary where it is supposed to hold.
 *
 * `strictNullChecks` is the switch. It is on in every `strict: true` project,
 * i.e. the default for new consumers, and then property access is a hard
 * TS2339. With it OFF the conditional types collapse to `any` instead, so the
 * output has no type safety at all — quieter, not better. tsconfig.typegaps.json
 * therefore checks with strictNullChecks on, which is also why this file imports
 * the built declarations rather than the source: the source itself does not
 * type-check under strictNullChecks (14 pre-existing errors, unrelated to these
 * gaps), and the .d.ts is what a consumer actually sees.
 *
 * Verified against the declarations emitted by tsconfig.prod.esm.json on
 * TypeScript 5.0.4 (the version in devDependencies).
 *
 *
 * Checked and NOT a gap
 * ---------------------
 * These were suspected during the audit and type-check cleanly — recorded so
 * they are not re-investigated:
 *
 *   each() nested in an object pattern, each(each(…)), each() inside AND;
 *   regex() / stringStartsWith() / numberLikePattern / nonEmptyStringPattern /
 *   numericRange() / ensure() used as patterns; typed function patterns such as
 *   `sani((input: number) => input)`; indexing an each() result; indexing an
 *   OBJECT() result; reading an optional-only key; an AND's scalar output.
 */


/* ------------------------------------------------------------------ *
 * SA-23a  A flat object pattern's output exposes no properties.
 *
 *   TS2339: Property 'name' does not exist on type
 *           'SanitizeNestedOb<{ name: StringConstructor;
 *                               age: NumberConstructor; }, true>'
 * ------------------------------------------------------------------ */
{
  const against = sani({ name: String, age: Number })
  const user = against({ name: "John", age: 20 })

  // @ts-expect-error SA-23a — the sanitized output should expose `name: string`
  const name: string = user.name
  // @ts-expect-error SA-23a — …and `age: number`
  const age: number = user.age

  void name; void age
}


/* ------------------------------------------------------------------ *
 * SA-23b  Nested object patterns are equally opaque, so a sanitized
 *         tree cannot be walked at all.
 * ------------------------------------------------------------------ */
{
  const against = sani({ settings: { darkMode: false, fontSize: Number } })
  const config = against({ settings: { fontSize: 16 } } as any)

  // @ts-expect-error SA-23b — the nested branch should be reachable
  void config.settings
}


/* ------------------------------------------------------------------ *
 * SA-23c  The README's headline example does not type-check, so the
 *         documented usage is unavailable to a strict consumer.
 * ------------------------------------------------------------------ */
{
  const userPattern = {
    name: String,
    "age?": Number,
    pin: new OR(Number, String),
    settings: {
      darkMode: false,
      fontSize: 16
    }
  }
  const user = sani(userPattern)({ name: "John", pin: 1234, settings: {} } as any)

  // @ts-expect-error SA-23c — README shows `user.name` being used directly
  void (user.name as string)
  // @ts-expect-error SA-23c — README shows `user.settings` being used directly
  void user.settings
}


/* ------------------------------------------------------------------ *
 * SA-23d  A union's output exposes no discriminant, so the idiomatic
 *         `switch (result.kind)` after sanitizing is unavailable — the
 *         one place the types would earn their keep.
 * ------------------------------------------------------------------ */
{
  const against = sani(new OR(
    { kind: new CONST("comment" as const), body: String },
    { kind: new CONST("like" as const) }
  ))
  const result = against({ kind: "like" } as any)

  // @ts-expect-error SA-23d — a discriminated union should expose its discriminant
  void result.kind
}


/* ------------------------------------------------------------------ *
 * SA-23e  The same for an AND pipeline that ends in an object pattern.
 * ------------------------------------------------------------------ */
{
  const against = sani(new AND(Object, { id: Number }))
  const out = against({ id: 1 } as any)

  // @ts-expect-error SA-23e — the final stage's shape should be visible
  void out.id
}
