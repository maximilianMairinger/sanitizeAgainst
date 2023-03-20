export async function polyfill() {
  if (!(Object as any).hasOwn) {
    const { shim } = await import("object.hasown")
    shim()
  }
}



type Prim<InputParam = unknown> = string | typeof String | number | typeof Number | boolean | typeof Boolean | ((input: InputParam) => unknown) | Combinator | typeof Object
type Obj = { [key: string]: Prim | Obj }
type Pattern = Prim | Obj



type InpPrim = string | number | boolean
type InpObj = { [key: string]: InpPrim | InpObj }
type Inp = InpPrim | InpObj

abstract class Combinator {
  patterns: Pattern[]
  sanis: Function[] // this gets generated in the recSanitize function
  abstract matches(input: unknown): unknown
}


abstract class BooleanCombinator extends Combinator {
  constructor(...inputs: any[]) {
    super()
    this.patterns = inputs
    // this.ar = ar.map((a) => sanitizeRec(a))
  }
}



export class AND<Pat extends Pattern> extends BooleanCombinator {
  private isAndComb: any
  constructor(...ar: [...Pattern[], Pat]) {
    super(...ar)
  }
  matches(input: unknown) {
    let curRet = input
    for (const a of this.sanis) {
      curRet = a(curRet)
    }
    return curRet as any
  }
}

export class OR<Arg extends Pattern[], Pat extends Arg[number] = Arg[number]> extends BooleanCombinator {
  // We need these props to make OR and AND unique types so we can check for them in the conditional type of ParseIfCombinator. Otherwise the first check would include both or something and not work.
  private isOrComb: any
  constructor(...ar: Arg) {
    super(...ar)
  }
  matches(input: unknown) {
    for (const a of this.sanis) {
      try {
        return a(input)
      } catch (e) {}
    }
    throw new Error("No match")
  }
}

export class NOT<Arg extends Pattern = Pattern, Pat extends Exclude<Pattern, Arg> = Exclude<Pattern, Arg>> extends Combinator {
  private isNOTComb: any
  constructor(ar: Arg) {
    super()
    this.patterns = [ar]
    // this.ar = sanitize(ar)
  }
  matches(input: unknown) {
    let throws: boolean
    try {
      this.sanis[0](input)
      throws = false
    } catch (e) {
      throws = true
    }
    if (throws) return input as any
    else throw new Error("Match")
  }
}

function getNumberOfQuestionmarksAtTheEndOfString(str: string) {
  let i = str.length - 1
  let count = 0
  while (str[i] === "?") {
    count++
    i--
  }
  return count
}

function againstPrimitiveDefault(type: string, defaultVal: unknown) {
  return (input: unknown) => {
    if (input === undefined || input === null) return defaultVal
    else if (typeof input === type) return input
    else throw new Error(`Input is not a ${type}`)
  }
}

function againstPrimitive(type: string) {
  return (input: unknown) => {
    if (typeof input === type) return input
    else throw new Error(`Input is not a ${type}`)
  }
}

let knownPatternObjects: WeakMap<object, (input: unknown) => unknown>
let knownInputObjects: WeakMap<object, object>
function sanitize<Pat extends Pattern>(pattern: Pat) {
  knownPatternObjects = new WeakMap()
  const out = sanitizeRec(pattern)
  knownPatternObjects = null
  return (input: Inputified<Pat>) => {
    knownInputObjects = new WeakMap()
    const out2 = out(input)
    knownInputObjects = null
    return out2
  }
}


function sanitizeRec<Pat extends Pattern>(pattern: Pat) {
  let against: (input: unknown) => unknown

  const type = typeof pattern

  if (type === "string") against = againstPrimitiveDefault("string", pattern)
  else if (type === "number") against = againstPrimitiveDefault("number", pattern)
  else if (type === "boolean") against = againstPrimitiveDefault("boolean", pattern)
  else if (pattern === String) against = againstPrimitive("string")
  else if (pattern === Number) against = againstPrimitive("number")
  else if (pattern === Boolean) against = againstPrimitive("boolean")
  else if (pattern instanceof Combinator) {
    pattern.sanis = pattern.patterns.map((input) => sanitizeRec(input))
    against = pattern.matches.bind(pattern)
  }
  else if (pattern === Object) against = (input) => {
    if (typeof input !== "object" || input === null || input instanceof Array) throw new Error('Input is not an object')
    return input
  }
  // It is important that this check is after all the constructor checks like if (input === Boolean)
  else if (pattern instanceof Function) against = pattern as any
  else if (typeof pattern === "object" && pattern !== null) {
    if (knownPatternObjects.has(pattern)) return knownPatternObjects.get(pattern) 

    const requiredPattern = new Map<any, any>()
    const optinalPattern = new Map<any, any>()
    for (const key in pattern) {
      const numberOfQuestionmarks = getNumberOfQuestionmarksAtTheEndOfString(key);
      let questionMarksToRemove = -Math.floor(numberOfQuestionmarks/2);
      const isEvan = numberOfQuestionmarks % 2 === 0;
      if (!isEvan) questionMarksToRemove--;
      const keyWithoutQuestionmarks = questionMarksToRemove !== 0 ? key.slice(0, questionMarksToRemove) : key;
      
      (isEvan ? requiredPattern : optinalPattern).set(keyWithoutQuestionmarks, sanitizeRec(pattern[key] as any))
    }

    against = (input) => {
      if (input === null || input === undefined) input = {}
      else if (typeof input !== "object" || input instanceof Array) throw new Error('Input is not an object')
      if (knownInputObjects.has(input as any)) return knownInputObjects.get(input as any)
      const out = Object.create(null)
      knownInputObjects.set(input as any, out)

      for (const [key, nestedAgainst] of requiredPattern) {
        const val = input[key] === undefined || Object.hasOwn(input as object, key) ? input[key] : undefined
        out[key] = nestedAgainst(val)
      }

      for (const [key, nestedAgainst] of optinalPattern) {
        if (Object.hasOwn(input as object, key)) out[key] = nestedAgainst(input[key])
      }

      // do this e.g. for equaals functions. Some implementations (e.g. fast-equals) check constructor for equality
      Object.setPrototypeOf(out, Object.prototype)
      
      return out
    }

    knownPatternObjects.set(pattern, against)
  }

  

  return against as (input: Inputified<Pat>) => Sanitized<Pat>
}


type EscapeAndFilterQuestionmarkKey<S extends string> = S extends `${infer T}?` ? T extends `${infer U}?` ? `${EscapeAndFilterQuestionmarkKey<U>}?` : T : never
type EscapeQuestionmarkKey<S extends string> = S extends `${infer T}?` ? T extends `${infer U}?` ? `${EscapeQuestionmarkKey<U>}?` : T : S



type PartiallyOptional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;


type EscapeAndFilterQuestionmarkProps<Ob> = {[key in keyof Ob as (key extends string ? EscapeAndFilterQuestionmarkKey<key> : key)]: any}
type EscapeQuestionmarkProps<Ob> = {[key in keyof Ob as key extends string ? EscapeQuestionmarkKey<key> : key]: Ob[key]}


type ParseIfCombinator<Val extends Prim> = Val extends AND<infer Pat> ? Sanitized<Pat> : Val extends OR<infer Arg> ? Sanitized<Arg[number]> : Val extends NOT<infer Arg> ? Exclude<Inp, Sanitized<Arg>> : Val // This cannot be done with a single combinator infer as of 12.03.2023.
type ParseVal<Val extends Prim> = Val extends ((...a: unknown[]) => unknown) ? ReturnType<Val> : Val extends typeof Number ? number : Val extends typeof String ? string : Val extends typeof Boolean ? boolean : ParseIfCombinator<Val>
type ParseValOb<Ob extends {[key in string]: Prim}> = {[key in keyof Ob]: ParseVal<Ob[key]>}

type SanitizeNotNestedOb<Ob extends {[key in string]: unknown}> = ParseValOb<PartiallyOptional<EscapeQuestionmarkProps<Ob>, keyof EscapeQuestionmarkProps<Ob> & keyof EscapeAndFilterQuestionmarkProps<Ob>>>
type SanitizeNestedOb<Ob extends {[key in string]: unknown}> = {[key in keyof SanitizeNotNestedOb<Ob>]: SanitizeNotNestedOb<Ob>[key] extends {[key in string]: unknown} ? SanitizeNotNestedOb<SanitizeNotNestedOb<Ob>[key]> : SanitizeNotNestedOb<Ob>[key]}

type Sanitized<Ob extends Pattern> = Ob extends Prim ? ParseVal<Ob> : Ob extends {[key in string]: unknown} ? SanitizeNestedOb<Ob> : never


type Inputified<Ob extends Pattern> = Sanitized<Ob>




export default sanitize


