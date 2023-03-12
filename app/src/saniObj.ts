type Prim<InputParam = unknown> = string | typeof String | number | typeof Number | boolean | typeof Boolean | ((input: InputParam) => unknown) | Combinator
type Obj = { [key: string]: Prim | Obj }
type Pattern = Prim | Obj



type InpPrim = string | number | boolean
type InpObj = { [key: string]: InpPrim | InpObj }
type Inp = InpPrim | InpObj

abstract class Combinator<Pat extends Pattern = Pattern> {
  abstract matches(input: unknown): unknown
}

abstract class BooleanCombinator<Pat extends Pattern = Pattern> extends Combinator<Pat> {
  public ar: Function[]
  constructor(...ar: (Obj | Prim)[]) {
    super()
    this.ar = ar.map((a) => sanitize(a))
  }
}


type _ParseIfCombinator<Val extends Prim> = Val extends AND<infer Pat> ? Sanitized<Pat> : Val extends OR<infer Pat> ? Sanitized<Pat> : Val extends NOT<infer Arg> ? Exclude<Inp, Sanitized<Arg>> : Val // This cannot be done with a single combinator infer as of 12.03.2023.
type QQQ = _ParseIfCombinator<AND<typeof Number>>
// type Q<Val> = Val extends Combinator<infer Pat> ? Pat extends  : Val

export class AND<Pat extends Pattern = Pattern> extends BooleanCombinator<Pat> {
  private isAndComb: any
  constructor(...ar: [...(Obj | Prim)[], Pat]) {
    super(...ar)
  }
  matches(input: unknown) {
    let curRet = input
    for (const a of this.ar) {
      curRet = a(curRet)
    }
    return curRet as any
  }
}

export class OR<Pat extends Pattern = Pattern> extends BooleanCombinator<Pat> {
  // We need these props to make OR and AND unique types so we can check for them in the conditional type of ParseIfCombinator. Otherwise the first check would include both or something and not work.
  private isOrComb: any
  constructor(...ar: ((Obj | Prim) & Pat)[]) {
    super(...ar)
  }
  matches(input: unknown) {
    for (const a of this.ar) {
      try {
        return a(input)
      } catch (e) {}
    }
    throw new Error("No match")
  }
}

export class NOT<Arg extends Pattern = Pattern, Pat extends Exclude<Pattern, Arg> = any> extends Combinator<Pat> {
  private isNOTComb: any
  public ar: Function
  constructor(ar: Arg) {
    super()
    this.ar = sanitize(ar)
  }
  matches(input: unknown) {
    let throws: boolean
    try {
      this.ar(input)
      throws = false
    } catch (e) {
      throws = true
    }
    if (throws) return input as any
    else throw new Error("Match")
  }
}

export function sanitize<Pat extends Pattern>(pattern: Pat) {
  let against: (input: unknown) => unknown
  
  if (typeof pattern === "string") against = (input) => {
    if (input === undefined || input === null) return pattern
    else if (typeof input === 'string') return input
    else throw new Error('Input is not a string')
  }
  else if (pattern === String) against = (input) => {
    if (typeof input === "string") return input
    else throw new Error('Input is not a string')
  }
  else if (typeof pattern === "number") against = (input) => {
    if (input === undefined || input === null) return pattern
    else if (typeof input === 'number') return input
    else throw new Error('Input is not a number')
  }
  else if (pattern === Number) against = (input) => {
    if (typeof input === "number") return input
    else throw new Error('Input is not a number')
  }
  else if (typeof pattern === "boolean") against = (input) => {
    if (input === undefined || input === null) return pattern
    else if (typeof input === 'boolean') return input
    else throw new Error('Input is not a boolean')
  }
  else if (pattern === Boolean) against = (input) => {
    if (typeof input === "boolean") return input
    else throw new Error('Input is not a boolean')
  }
  else if (pattern instanceof Function) against = pattern as any
  else if (pattern instanceof Combinator) against = pattern.matches.bind(pattern)
  else if (typeof pattern === "object" && pattern !== null) {
    const requiredPattern = new Map<any, any>()
    const optinalPattern = new Map<any, any>()
    for (const key in pattern) {
      if (key.endsWith("?")) {
        if (key.endsWith("??")) requiredPattern.set(key, sanitize(pattern[key.slice(0, -1)]))
        else optinalPattern.set(key, sanitize(pattern[key.slice(0, -1)]))
      }
      else requiredPattern.set(key, sanitize(pattern[key] as any))
    }

    against = (input) => {
      if (typeof input !== "object" || input === null) throw new Error('Input is not an object')
      const out = Object.create(null)

      for (const [key, val] of requiredPattern) {
        out[key] = val(input[key])
      }

      for (const [key, val] of optinalPattern) {
        if (input[key] !== undefined) out[key] = val(input[key])
      }


      
      return out
    }
  }

  

  return against as (input: Inputified<Pat>) => Sanitized<Pat>
}


type EscapeAndFilterQuestionmarkKey<S extends string> = S extends `${infer T}?` ? T extends `${infer U}?` ? `${EscapeAndFilterQuestionmarkKey<U>}?` : T : never
type EscapeQuestionmarkKey<S extends string> = S extends `${infer T}?` ? T extends `${infer U}?` ? `${EscapeQuestionmarkKey<U>}?` : T : S



type PartiallyOptional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;


type EscapeAndFilterQuestionmarkProps<Ob> = {[key in keyof Ob as (key extends string ? EscapeAndFilterQuestionmarkKey<key> : key)]: any}
type EscapeQuestionmarkProps<Ob> = {[key in keyof Ob as key extends string ? EscapeQuestionmarkKey<key> : key]: Ob[key]}


type ParseIfCombinator<Val extends Prim> = Val extends AND<infer Pat> ? Sanitized<Pat> : Val extends OR<infer Pat> ? Sanitized<Pat> : Val extends NOT<infer Arg> ? Exclude<Inp, Sanitized<Arg>> : Val // This cannot be done with a single combinator infer as of 12.03.2023.
type ParseVal<Val extends Prim> = Val extends ((...a: unknown[]) => unknown) ? ReturnType<Val> : Val extends typeof Number ? number : Val extends typeof String ? string : Val extends typeof Boolean ? boolean : ParseIfCombinator<Val>
type ParseValOb<Ob extends {[key in string]: Prim}> = {[key in keyof Ob]: ParseVal<Ob[key]>}

type SanitizeNotNestedOb<Ob extends {[key in string]: unknown}> = ParseValOb<PartiallyOptional<EscapeQuestionmarkProps<Ob>, keyof EscapeQuestionmarkProps<Ob> & keyof EscapeAndFilterQuestionmarkProps<Ob>>>
type SanitizeNestedOb<Ob extends {[key in string]: unknown}> = {[key in keyof SanitizeNotNestedOb<Ob>]: SanitizeNotNestedOb<Ob>[key] extends {[key in string]: unknown} ? SanitizeNotNestedOb<Ob>[key] : SanitizeNotNestedOb<Ob>[key]}

type Sanitized<Ob extends Pattern> = Ob extends Prim ? ParseVal<Ob> : Ob extends {[key in string]: unknown} ? SanitizeNestedOb<Ob> : never


type Inputified<Ob extends Pattern> = Sanitized<Ob>




export default sanitize



const e = sanitize({"req?": {
  "name?": "string",
  "age??": "number",
}})


const eee = e({})
