import { circularDeepEqual } from "fast-equals"
import clone from "circ-clone"

// quick and dirty implementation of the jest expect function
export const expect = (exp: any) => ({
  eq: (...got: any) => {
    let pass = false
    for (const g of got) {
      if (circularDeepEqual(clone(exp), clone(g))) {
        pass = true
        break
      }
    }

    if (!pass) {
      console.error("Expected", exp, "to be deeply equal to", got)
      throw new Error()
    }
  },
  toBeInstanceOf: (cls: any) => {
    if (!(exp instanceof cls)) throw new Error(`Expected ${exp} to be instance of ${cls}`)
  },
  toThrow: () => {
    let pass = false
    try {
      exp()
      pass = false
    } catch (e) {
      pass = true
    }
    if (!pass) throw new Error(`Expected ${exp} to throw`)
  }
})