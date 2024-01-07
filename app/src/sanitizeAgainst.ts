export async function polyfill() {
  if (!(Object as any).hasOwn) {
    const { shim } = await import("object.hasown")
    shim()
  }
}


declare global {
  // @ts-ignore
  var String:  {stringConstructorIdentifier19823718723:  true} & StringConstructor;
  // @ts-ignore
  var Number:  {numberConstructorIdentifier19823718723:  true} & NumberConstructor;
  // @ts-ignore
  var Boolean: {booleanConstructorIdentifier19823718723: true} & BooleanConstructor;
  // @ts-ignore
  var Object:  {ObjectConstructorIdentifier19823718723:  true} & ObjectConstructor;
  // @ts-ignore
  var Function: {FunctionConstructorIdentifier19823718723: true} & FunctionConstructor;
}


export function isConstructor(f: Function) {
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
  protected init?(): void
  protected abstract matches(input: unknown): unknown
  protected abstract [fromInstanceSym]: string
}

type PossibleKeyPatterns = Pattern & (((key: string) => string) | Combinator | CONST<any> | typeof String | AND<typeof String, typeof Number>)




export class OBJECT<ValuePattern extends Pattern, KeyPattern extends PossibleKeyPatterns, Deep extends boolean = false> extends Matcher {
  protected get [fromInstanceSym]() {return "OBJECT"}
  private saniValue: Function
  private saniKey: Function
  private soft: boolean
  private keyPattern: KeyPattern
  private deep: boolean
  constructor(valuePattern: ValuePattern, soft: boolean, deep?: Deep) 
  constructor(valuePattern?: ValuePattern, keyPattern?: KeyPattern, soft?: boolean, deep?: Deep) 
  constructor(private valuePattern: ValuePattern = (a => a) as any, keyPattern_soft: KeyPattern = (a => a) as any, soft_deep = false, deep = false) {
    super()
    if (typeof keyPattern_soft === "boolean") {
      this.keyPattern = (a => a) as any
      this.soft = keyPattern_soft
      this.deep = soft_deep
    }
    else {
      this.keyPattern = keyPattern_soft
      this.soft = soft_deep
      this.deep = deep
    }
    if (this.deep) this.valuePattern = new OR(this.valuePattern, this) as any
  }
  protected init() {
    this.init = () => {}
    this.saniKey = sanitizeRec(this.keyPattern)
    this.saniValue = sanitizeRec(this.valuePattern)
  }
  protected matches(input: unknown): unknown {
    if (!(typeof input === "object" && input !== null && (Object.getPrototypeOf(input) === null || Object.getPrototypeOf(input).constructor === Object))) throw new Error("Input is not a plain object")
    if (knownInputObjects.has(input as any)) return knownInputObjects.get(input as any)
    const out = {}
    knownInputObjects.set(input as any, out)
    for (const key in input as any) {
      if (out[key] !== undefined) continue // prototype poisoning protection
      if (!this.soft) {
        out[this.saniKey(key)] = this.saniValue(input[key])
      }
      else {
        try {
          out[this.saniKey(key)] = this.saniValue(input[key])
        }
        catch (e) {}
      }
    }
    return out
  }
}

const isPromiseSani = sanitizeRec(Promise)
export class AWAITED<Pat extends Pattern> extends Matcher {
  protected get [fromInstanceSym]() {return "AWAITED"}
  public sani: Function
  constructor(private _pattern: Pat) {
    super()
  }
  protected init() {
    this.sani = sanitizeRec(this.pattern)
  }
  private get pattern(): Pat {
    return this._pattern instanceof AWAITED ? this._pattern.pattern : this._pattern
  }
  protected matches(input: unknown): unknown {
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
  protected get [fromInstanceSym]() {return "CONST"}
  constructor(private constVal: MyPattern) {super()}
  protected matches(input: unknown): unknown {
    if (input !== this.constVal) throw `Expected ${this.constVal}, got ${input}`
    return input
  }
}




abstract class Combinator extends Matcher {
  protected patterns: Pattern[]
  protected sanis: Function[] // this gets generated in the recSanitize function
  protected init() {
    this.sanis = this.patterns.map((a) => sanitizeRec(a))
  }
}


abstract class BooleanCombinator extends Combinator {
  constructor(...inputs: any[]) {
    super()
    this.patterns = inputs
  }
}






type SanitizeTuple<Tuple extends (Pattern | unknown)[], Output extends boolean> = {
  [key in keyof Tuple]: Tuple[key] extends Pattern ? Sanitized<Tuple[key], Output> : unknown
}

type FilterOutAnyTuple<Tuple extends Pattern[]> = {
  [key in keyof Tuple]: IsAny<Tuple[key]> extends true ? unknown : Tuple[key]
}

type FMay<As extends Pattern[], Output extends boolean = true> = ((f1: TupleToIntersection<SanitizeTuple<FilterOutAnyTuple<As>, Output>>) => any) | NOT<(a: TupleToIntersection<SanitizeTuple<FilterOutAnyTuple<As>, Output>>) => unknown>


type IsAny<T> = 0 extends (1 & T) ? true : false


export class AND<A1 extends Pattern, A2 extends Pattern = any, A3 extends Pattern = any, A4 extends Pattern = any, A5 extends Pattern = any, A6 extends Pattern = any, A7 extends Pattern = any, A8 extends Pattern = any, A9 extends Pattern = any, A10 extends Pattern = any, R extends FilterOutAnyTuple<[A1,A2,A3,A4,A5,A6,A7,A8,A9,A10]> = FilterOutAnyTuple<[A1,A2,A3,A4,A5,A6,A7,A8,A9,A10]>> extends BooleanCombinator {

  private isAnd: any
  protected get [fromInstanceSym]() {return "AND"}
  


  // constructor(f1: A1)
  // constructor(f1: A1 | ((a: Sanitized<A1Hint>) => any), f2: NOT<(a: SaniRet<A1>) => unknown>)
  // constructor(f1: A1, f2: A2 | FMay<A1>)
  // constructor(f1: A1, f2: A2 | FMay<A1>, f3: (A3 | FMay<A2>))
  // constructor(f1: A1, f2: A2 | FMay<A1>, f3: A3 | FMay<A2>, f4: (A4 | FMay<A3>))
  // constructor(f1: A1, f2: A2 | FMay<A1>, f3: A3 | FMay<A2>, f4: A4 | FMay<A3>, f5: (A5 | FMay<A4>))
  // constructor(f1: A1, f2: A2 | FMay<A1>, f3: A3 | FMay<A2>, f4: A4 | FMay<A3>, f5: A5 | FMay<A4>, f6: (A6 | FMay<A5>))
  // constructor(f1: A1, f2: A2 | FMay<A1>, f3: A3 | FMay<A2>, f4: A4 | FMay<A3>, f5: A5 | FMay<A4>, f6: A6 | FMay<A5>, f7: (A7 | FMay<A6>))
  // constructor(f1: A1, f2: A2 | FMay<A1>, f3: A3 | FMay<A2>, f4: A4 | FMay<A3>, f5: A5 | FMay<A4>, f6: A6 | FMay<A5>, f7: A7 | FMay<A6>, f8: (A8 | FMay<A7>))
  // constructor(f1: A1, f2: A2 | FMay<A1>, f3: A3 | FMay<A2>, f4: A4 | FMay<A3>, f5: A5 | FMay<A4>, f6: A6 | FMay<A5>, f7: A7 | FMay<A6>, f8: A8 | FMay<A7>, f9: (A9 | FMay<A8>))
  constructor(f1: A1, f2?: A2 | FMay<[A1]>, f3?: A3 | FMay<[A1, A2]>, f4?: A4 | FMay<[A1,A2,A3]>, f5?: A5 | FMay<[A1,A2,A3,A4]>, f6?: A6 | FMay<[A1,A2,A3,A4,A5]>, f7?: A7 | FMay<[A1,A2,A3,A4,A5,A6]>, f8?: A8 | FMay<[A1,A2,A3,A4,A5,A6,A7]>, f9?: A9 | FMay<[A1,A2,A3,A4,A5,A6,A7,A8]>, f10?: A10 | FMay<[A1,A2,A3,A4,A5,A6,A7,A8,A9]>)
  // constructor(f1: A1, f2?: (FMay<[A1]>))
  

  constructor(...ar: Pattern[]) {
  // constructor(...ar: AllPats & ([(never | Pattern) & A1, ((a: A1) => any)])) {
    super(...ar)
  }
  protected matches(input: unknown) {
    let curRet = input
    for (const a of this.sanis) {
      curRet = a(curRet)
    }
    return curRet as any
  }
}




export class OR<Arg extends Pattern[], Pat extends Arg[number] = Arg[number]> extends BooleanCombinator {
  private isOr: any
  protected get [fromInstanceSym]() {return "OR"}
  
  
  private awaitedSanis: AWAITED<any>[]
  private nonAwaitedSanis: Function[]
  constructor(...ar: Arg) {
    super(...ar)
  }
  protected init() {
    super.init()
    this.awaitedSanis = this.sanis.filter((a) => a[fromInstanceSym] !== undefined && a[fromInstanceSym][fromInstanceSym] === "AWAITED").map((a) => a[fromInstanceSym])
    this.nonAwaitedSanis = this.sanis.filter((a) => !(a[fromInstanceSym] !== undefined && a[fromInstanceSym][fromInstanceSym] === "AWAITED"))
  }
  protected matches(input: unknown) {
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
        throw new Error("All awaited patterns failed")
      })
    }
    throw new Error("All patterns failed")
  }

  addPattern(pat: Pattern) {
    this.patterns.push(pat)
  }
}

export class NOT<FunctionHint extends ((a: unknown) => unknown), Arg extends Pattern = FunctionHint> extends Combinator {
  private isNot: any
  protected get [fromInstanceSym]() {return "NOT"}
  constructor(ar: Arg)
  constructor(f1: FunctionHint & Arg)
  constructor(ar: Arg) {
    super()
    this.patterns = [ar]
    // this.ar = sanitize(ar)
  }
  protected matches(input: unknown) {
    let throws: boolean
    try {
      this.sanis[0](input)
      throws = false
    } catch (e) {
      throws = true
    }
    if (throws) return input as any
    else throw new Error("Matched even though it is negated.")
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
  else if (pattern === Function) against = againstPrimitive("function")
  else if (pattern instanceof Matcher) {
    if ((pattern as any).init) (pattern as any).init()
    against = (pattern as any).matches.bind(pattern)
    against[fromInstanceSym] = pattern
  }
  else if (pattern === Object) against = (input) => {
    if (input instanceof Object || (typeof input === "object" && input !== null)) return input
    else throw new Error('Input is not instanceof object')
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
      else if (typeof input !== "object" || !(Object.getPrototypeOf(input) === null || Object.getPrototypeOf(input).constructor === Object)) throw new Error('Input is not a plain object')
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




type DeepOBJECT<ValArg extends Pattern, KeyArg extends PossibleKeyPatterns, Output extends boolean> = {[key in Sanitized<KeyArg, Output>]: Sanitized<ValArg> | DeepOBJECT<ValArg, KeyArg, Output>}

type ParseIfCombinator<Val extends Prim, Output extends boolean> = Val extends AND<infer _0, infer _1, infer _2, infer _3, infer _4, infer _5, infer _6, infer _7, infer _8, infer _9, infer Args> ? TupleToIntersection<SanitizeTuple<Args, Output>> : Val extends OR<infer Arg> ? AWAITED<any> extends Arg[number] ? Output extends true ? Promise<Awaited<Sanitized<Arg[number], Output>>> : Sanitized<Arg[number], Output> : Sanitized<Arg[number], Output> : Val extends NOT<infer _, infer Arg> ? Exclude<Inp, Sanitized<Arg, Output>> : Val extends CONST<infer Arg> ? Arg : Val extends AWAITED<infer Arg> ? Promise<Sanitized<Arg, Output> extends Promise<any> ? Awaited<Sanitized<Arg, Output>> : Sanitized<Arg, Output>> : Val extends OBJECT<infer ValArg, infer KeyArg, infer Deep> ? Deep extends false ? {[key in Sanitized<KeyArg, Output>]: Sanitized<ValArg>} : DeepOBJECT<ValArg, KeyArg, Output> : Val
type ParseVal<Val extends Prim, Output extends boolean> = Val extends typeof Number ? number : Val extends typeof String ? string : Val extends typeof Boolean ? boolean : Val extends Matcher ? ParseIfCombinator<Val, Output> : Val extends {new(...a:any[]): infer I} ? I : Val extends number ? number : Val extends string ? string : Val extends boolean ? boolean : Val extends ((a: infer Inp) => infer Out) ? Output extends true ? Out : Inp : Val
type ParseValOb<Ob extends {[key in string]: Prim}, Output extends boolean> = RemovePropsByValue<{[key in keyof Ob]: Ob[key] extends PrimWithDefault ? never : ParseVal<Ob[key], Output>}, never> & RemovePropsByValue<{[key in keyof Ob]?: Ob[key] extends PrimWithDefault ? Ob[key] : never}, never>


type SanitizeNotNestedOb<Ob extends {[key in string]: unknown}, Output extends boolean> = ParseValOb<PartiallyOptional<EscapeQuestionmarkProps<Ob>, keyof EscapeQuestionmarkProps<Ob> & keyof EscapeAndFilterQuestionmarkProps<Ob>>, Output>
type SanitizeNestedOb<Ob extends {[key in string]: unknown}, Output extends boolean> = {[key in keyof SanitizeNotNestedOb<Ob, Output>]: SanitizeNotNestedOb<Ob, Output>[key] extends {[key in string]: unknown} ? SanitizeNotNestedOb<SanitizeNotNestedOb<Ob, Output>[key], Output> : SanitizeNotNestedOb<Ob, Output>[key]}

type Sanitized<Ob extends Pattern, Output extends boolean = true> = Ob extends Prim ? ParseVal<Ob, Output> : Ob extends {[key in string]: unknown} ? SanitizeNestedOb<Ob, Output> : never


type RemovePropsByValue<T, V> = {
  [K in keyof T as T[K] extends V ? never : K]: T[K];
};
type TupleToIntersection<T extends any[]> = (T extends [infer Head, ...infer Rest] ? Head & TupleToIntersection<Rest> : unknown);


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

export function numericRange(lowerBound: number, upperBound: number) {
  return ensure((input: number) => input >= lowerBound && input <= upperBound, `Input must be between ${lowerBound} and ${upperBound}`)
}

export const nonEmptyStringPattern = new AND(String, ensure((input: string) => input !== "", "Input must be a non-empty string"))

export const any = (a: unknown) => a

export const unknown = (a: unknown) => {
  if (a === undefined || a === null) throw new Error("Input must not be undefined or null")
  else return a
}
