export async function polyfill() {
  if (!(Object as any).hasOwn) {
    const { shim } = await import("object.hasown")
    shim()
  }
}


function isConstructor(f: Function) {
  return f.prototype !== undefined
}


type PrimWithDefault = string | number | boolean
type Prim<InputParam = unknown> = typeof String | typeof Number | typeof Boolean | ((input: InputParam) => unknown) | Matcher | typeof Object | {new(...a:any[]): unknown} | typeof Function | PrimWithDefault
type Obj = { [key: string]: Prim | Obj }
type Pattern = Prim | Obj

type InpPrim = string | number | boolean
type InpObj = { [key: string]: InpPrim | InpObj }
type Inp = InpPrim | InpObj


const fromInstanceSym = Symbol("fromInstance")

abstract class Matcher {
  init?(): void
  abstract matches(input: unknown): unknown
  abstract [fromInstanceSym]: string
}

type PossibleKeyPatterns = Pattern & (((key: string) => string) | Combinator | CONST<any> | typeof String | AND<(a: any) => (string | number)>)



const isObjectSani = sanitizeRec(Object)
export class OBJECT<ValuePattern extends Pattern, KeyPattern extends PossibleKeyPatterns> extends Matcher {
  get [fromInstanceSym]() {return "OBJECT"}
  private saniValue: Function
  private saniKey: Function
  constructor(private valuePattern: ValuePattern, private keyPattern: KeyPattern = (a => a) as any) {
    super()
  }
  init() {
    this.saniKey = sanitizeRec(this.keyPattern)
    this.saniValue = sanitizeRec(this.valuePattern)
  }
  matches(input: unknown): unknown {
    isObjectSani(input)
    if (knownInputObjects.has(input as any)) return knownInputObjects.get(input as any)
    const out = {}
    knownInputObjects.set(input as any, out)
    for (const key in input as any) {
      if (out[key] !== undefined) continue // prototype poisoning protection
      out[this.saniKey(key)] = this.saniValue(input[key])
    }
    return out
  }
}

const isPromiseSani = sanitizeRec(Promise)
export class AWAITED<Pat extends Pattern> extends Matcher {
  get [fromInstanceSym]() {return "AWAITED"}
  public sani: Function
  constructor(private _pattern: Pat) {
    super()
  }
  init() {
    this.sani = sanitizeRec(this.pattern)
  }
  private get pattern(): Pat {
    return this._pattern instanceof AWAITED ? this._pattern.pattern : this._pattern
  }
  matches(input: unknown): unknown {
    isPromiseSani(input)
    const myKnownInputObjects = knownInputObjects
    return (input as Promise<any>).then((input) => {
      knownInputObjects = myKnownInputObjects
      const r = this.sani(input)
      knownInputObjects = null
      return r
    })
  }
}


export class CONST<MyPattern extends string | number | boolean> extends Matcher {
  get [fromInstanceSym]() {return "CONST"}
  constructor(private constVal: MyPattern) {super()}
  matches(input: unknown): unknown {
    if (input !== this.constVal) throw `Expected ${this.constVal}, got ${input}`
    return input
  }
}




abstract class Combinator extends Matcher {
  patterns: Pattern[]
  sanis: Function[] // this gets generated in the recSanitize function
  init() {
    this.sanis = this.patterns.map((a) => sanitizeRec(a))
  }
}


abstract class BooleanCombinator extends Combinator {
  constructor(...inputs: any[]) {
    super()
    this.patterns = inputs
  }
}


type FMay<A extends Pattern> = ((f1: A extends (...args: any) => any ? Sanitized<ReturnType<A>> : Sanitized<A>) => any)



export class AND<R, A1 extends Pattern = any, A1Hint extends Pattern = any, A2 extends Pattern = any, A3 extends Pattern = any, A4 extends Pattern = any, A5 extends Pattern = any, A6 extends Pattern = any, A7 extends Pattern = any, A8 extends Pattern = any, A9 extends Pattern = any, A10 extends Pattern = any> extends BooleanCombinator {
  private isAnd: any
  get [fromInstanceSym]() {return "AND"}
  


  constructor(f1: (A1 | ((a: Sanitized<A1Hint>) => any)) & R)
  constructor(f1: A1 | ((a: Sanitized<A1Hint>) => any), f2: (A2 | FMay<A1>) & R)
  constructor(f1: A1 | ((a: Sanitized<A1Hint>) => any), f2: A2 | FMay<A1>, f3: (A3 | FMay<A2>) & R)
  constructor(f1: A1 | ((a: Sanitized<A1Hint>) => any), f2: A2 | FMay<A1>, f3: A3 | FMay<A2>, f4: (A4 | FMay<A3>) & R)
  constructor(f1: A1 | ((a: Sanitized<A1Hint>) => any), f2: A2 | FMay<A1>, f3: A3 | FMay<A2>, f4: A4 | FMay<A3>, f5: (A5 | FMay<A4>) & R)
  constructor(f1: A1 | ((a: Sanitized<A1Hint>) => any), f2: A2 | FMay<A1>, f3: A3 | FMay<A2>, f4: A4 | FMay<A3>, f5: A5 | FMay<A4>, f6: (A6 | FMay<A5>) & R)
  constructor(f1: A1 | ((a: Sanitized<A1Hint>) => any), f2: A2 | FMay<A1>, f3: A3 | FMay<A2>, f4: A4 | FMay<A3>, f5: A5 | FMay<A4>, f6: A6 | FMay<A5>, f7: (A7 | FMay<A6>) & R)
  constructor(f1: A1 | ((a: Sanitized<A1Hint>) => any), f2: A2 | FMay<A1>, f3: A3 | FMay<A2>, f4: A4 | FMay<A3>, f5: A5 | FMay<A4>, f6: A6 | FMay<A5>, f7: A7 | FMay<A6>, f8: (A8 | FMay<A7>) & R)
  constructor(f1: A1 | ((a: Sanitized<A1Hint>) => any), f2: A2 | FMay<A1>, f3: A3 | FMay<A2>, f4: A4 | FMay<A3>, f5: A5 | FMay<A4>, f6: A6 | FMay<A5>, f7: A7 | FMay<A6>, f8: A8 | FMay<A7>, f9: (A9 | FMay<A8>) & R)
  constructor(f1: A1 | ((a: Sanitized<A1Hint>) => any), f2: A2 | FMay<A1>, f3: A3 | FMay<A2>, f4: A4 | FMay<A3>, f5: A5 | FMay<A4>, f6: A6 | FMay<A5>, f7: A7 | FMay<A6>, f8: A8 | FMay<A7>, f9: A9 | FMay<A8>, f10: (A10 | FMay<A9>) & R)
  

  // constructor(...ar: Pattern[])
  constructor(...ar: Pattern[]) {
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
  private isOr: any
  get [fromInstanceSym]() {return "OR"}
  
  
  private awaitedSanis: AWAITED<any>[]
  private nonAwaitedSanis: Function[]
  constructor(...ar: Arg) {
    super(...ar)
  }
  init() {
    super.init()
    this.awaitedSanis = this.sanis.filter((a) => a[fromInstanceSym] !== undefined && a[fromInstanceSym][fromInstanceSym] === "AWAITED").map((a) => a[fromInstanceSym])
    this.nonAwaitedSanis = this.sanis.filter((a) => !(a[fromInstanceSym] !== undefined && a[fromInstanceSym][fromInstanceSym] === "AWAITED"))
  }
  matches(input: unknown) {
    for (const a of this.nonAwaitedSanis) {
      try {
        const r = a(input)
        return this.awaitedSanis.length === 0 ? r : Promise.resolve(r)
      } catch (e) {}
    }
    if (this.awaitedSanis.length !== 0 && input instanceof Promise) {
      const myKnownInputObjects = knownInputObjects
      return input.then((input) => {
        knownInputObjects = myKnownInputObjects
        for (const a of this.awaitedSanis) {
          try {
            const r = a.sani(input)
            knownInputObjects = null
            return r
          }
          catch(e) {}
        }
        throw new Error("No match")
      })
    }
    throw new Error("No match")
  }
}

export class NOT<Arg extends Pattern = Pattern, Pat extends Exclude<Pattern, Arg> = Exclude<Pattern, Arg>> extends Combinator {
  private isNot: any
  get [fromInstanceSym]() {return "NOT"}
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
  return ensure(input => typeof input === type, `Input is not a ${type}`)
}

let knownPatternObjects: WeakMap<object, (input: unknown) => unknown>
let knownInputObjects: WeakMap<object, object>
function sanitize<Pat extends Pattern>(pattern: Pat) {
  knownPatternObjects = new WeakMap()
  const out = sanitizeRec(pattern)
  knownPatternObjects = null
  return (input: Sanitized<Pat, false>): Sanitized<Pat, true> => {
    knownInputObjects = new WeakMap()
    const out2 = out(input)
    knownInputObjects = null
    return out2 as Sanitized<Pat, true>
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
  else if (pattern === Function) against = (input) => {
    if (!(input instanceof Function)) throw new Error('Input is not a function')
    return input
  }
  else if (pattern instanceof Matcher) {
    if (pattern.init) pattern.init()
    against = pattern.matches.bind(pattern)
    against[fromInstanceSym] = pattern
  }
  else if (pattern === Object) against = (input) => {
    if (typeof input !== "object" || input === null || input instanceof Array) throw new Error('Input is not an object')
    return input
  }
  // It is important that this check is after all the constructor checks like if (input === Boolean)
  else if (pattern instanceof Function) {
    if (isConstructor(pattern)) against = (input) => {
      if (!(input instanceof pattern)) throw new Error(`Input is not an instance of ${pattern.name}`)
      return input
    }
    else against = pattern as any
  }
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

      // do this e.g. for equals functions. Some implementations (e.g. fast-equals) check constructor for equality
      Object.setPrototypeOf(out, Object.prototype)
      
      return out
    }

    knownPatternObjects.set(pattern, against)
  }

  

  return against as (input: Sanitized<Pat, false>) => Sanitized<Pat, true>
}


type EscapeAndFilterQuestionmarkKey<S extends string> = S extends `${infer T}?` ? T extends `${infer U}?` ? `${EscapeAndFilterQuestionmarkKey<U>}?` : T : never
type EscapeQuestionmarkKey<S extends string> = S extends `${infer T}?` ? T extends `${infer U}?` ? `${EscapeQuestionmarkKey<U>}?` : T : S



type PartiallyOptional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;


type EscapeAndFilterQuestionmarkProps<Ob> = {[key in keyof Ob as (key extends string ? EscapeAndFilterQuestionmarkKey<key> : key)]: any}
type EscapeQuestionmarkProps<Ob> = {[key in keyof Ob as key extends string ? EscapeQuestionmarkKey<key> : key]: Ob[key]}






type ParseIfCombinator<Val extends Prim, Output extends boolean> = Val extends AND<infer Out, infer Inp> ? Output extends true ? Out extends Pattern ? Sanitized<Out, Output> : never : Sanitized<Inp, Output> : Val extends OR<infer Arg> ? AWAITED<any> extends Arg[number] ? Output extends true ? Promise<Awaited<Sanitized<Arg[number], Output>>> : Sanitized<Arg[number], Output> : Sanitized<Arg[number], Output> : Val extends NOT<infer Arg> ? Exclude<Inp, Sanitized<Arg, Output>> : Val extends CONST<infer Arg> ? Arg : Val extends AWAITED<infer Arg> ? Promise<Sanitized<Arg, Output> extends Promise<any> ? Awaited<Sanitized<Arg, Output>> : Sanitized<Arg, Output>> : Val extends OBJECT<infer ValArg, infer KeyArg> ? {[key in Sanitized<KeyArg, Output>]: Sanitized<ValArg>} : Val
type ParseVal<Val extends Prim, Output extends boolean> = Val extends typeof Number ? number : Val extends typeof String ? string : Val extends typeof Boolean ? boolean : Val extends Matcher ? ParseIfCombinator<Val, Output> : Val extends {new(...a:any[]): infer I} ? I : Val extends number ? number : Val extends string ? string : Val extends boolean ? boolean : Val extends ((a: infer Inp) => infer Out) ? Output extends true ? Out : Inp : Val
type ParseValOb<Ob extends {[key in string]: Prim}, Output extends boolean> = RemovePropsByValue<{[key in keyof Ob]: Ob[key] extends PrimWithDefault ? never : ParseVal<Ob[key], Output>}, never> & RemovePropsByValue<{[key in keyof Ob]?: Ob[key] extends PrimWithDefault ? Ob[key] : never}, never>


type SanitizeNotNestedOb<Ob extends {[key in string]: unknown}, Output extends boolean> = ParseValOb<PartiallyOptional<EscapeQuestionmarkProps<Ob>, keyof EscapeQuestionmarkProps<Ob> & keyof EscapeAndFilterQuestionmarkProps<Ob>>, Output>
type SanitizeNestedOb<Ob extends {[key in string]: unknown}, Output extends boolean> = {[key in keyof SanitizeNotNestedOb<Ob, Output>]: SanitizeNotNestedOb<Ob, Output>[key] extends {[key in string]: unknown} ? SanitizeNotNestedOb<SanitizeNotNestedOb<Ob, Output>[key], Output> : SanitizeNotNestedOb<Ob, Output>[key]}

type Sanitized<Ob extends Pattern, Output extends boolean = true> = Ob extends Prim ? ParseVal<Ob, Output> : Ob extends {[key in string]: unknown} ? SanitizeNestedOb<Ob, Output> : never


type RemovePropsByValue<T, V> = {
  [K in keyof T as T[K] extends V ? never : K]: T[K];
};


export default sanitize




export function ensure<T>(validate: (input: T) => boolean, msg?: string | ((input: T) => string)) {
  return (input: T) => {
    if (!validate(input)) throw new Error(msg instanceof Function ? msg(input) : msg)
    return input
  }
}




const errorMsg = "Input must be of type number or a numberlike string, but is " 
export const numberLikeStringPattern = new AND(
  new OR(String, Number),
  ensure((input: string | number) => input !== "", errorMsg + "an empty string"), 
  ensure((input: string | number) => !isNaN(+input), (input) => errorMsg + "NaN (parsed from \"" + input + "\")"), 
  s => s + ""
)

export function stringStartsWith<S extends string>(s: S) {
  return ensure((input: `${S}${string}`) => input.startsWith(s), `Input must start with ${s}`)
}


