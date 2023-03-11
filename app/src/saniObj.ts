type Prim = string | typeof String | number | typeof Number | boolean | typeof Boolean | ((input: unknown) => unknown)
type Ob = { [key: string]: Prim | Ob }

export function sanitize<Pattern extends Ob | Prim>(pattern: Pattern) {
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
  else if (pattern instanceof Array) {
    const myPattern = pattern.map(sanitize)
    against = (input) => {
      let curRet
      for (const myPat of myPattern) {
        curRet = myPat(input as any)
      }
      return curRet
    }
  }
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

  

  return against as (input: Sanitized<Pattern>) => Sanitized<Pattern>
}


type EscapeAndFilterQuestionmarkKey<S extends string> = S extends `${infer T}?` ? T extends `${infer U}?` ? `${EscapeAndFilterQuestionmarkKey<U>}?` : T : never
type EscapeQuestionmarkKey<S extends string> = S extends `${infer T}?` ? T extends `${infer U}?` ? `${EscapeQuestionmarkKey<U>}?` : T : S



type PartiallyOptional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;


type EscapeAndFilterQuestionmarkProps<Ob> = {[key in keyof Ob as (key extends string ? EscapeAndFilterQuestionmarkKey<key> : key)]: any}
type EscapeQuestionmarkProps<Ob> = {[key in keyof Ob as key extends string ? EscapeQuestionmarkKey<key> : key]: Ob[key]}

type SanitizeNotNestedOb<Ob extends {[key in string]: unknown}> = PartiallyOptional<EscapeQuestionmarkProps<Ob>, keyof EscapeQuestionmarkProps<Ob> & keyof EscapeAndFilterQuestionmarkProps<Ob>>
type SanitizeNestedOb<Ob extends {[key in string]: unknown}> = {[key in keyof SanitizeNotNestedOb<Ob>]: SanitizeNotNestedOb<Ob>[key] extends {[key in string]: unknown} ? SanitizeNotNestedOb<SanitizeNotNestedOb<Ob>[key]> : SanitizeNotNestedOb<Ob>[key]}

type Sanitized<Ob> = Ob extends {[key in string]: unknown} ? SanitizeNestedOb<Ob> : Ob







export default sanitize



const e = sanitize({"req?": {
  "name?": "string",
  "age??": "number",
}})


const eee = e({})
