import expectOrdered from "jest-expect-ordered"
import { stringify } from "circ-json"
import { circularDeepEqual } from "fast-equals"
import clone from "circ-clone"
import { toOrdinal } from "number-to-words"

declare global {
  namespace jest {
    interface Matchers<R, T> {
      eq(...got: any[]): CustomMatcherResult
    }
  }
}


function eq(exp, ...got) {
  let pass = false
  for (const g of got) {
    if (circularDeepEqual(clone(exp), clone(g))) {
      pass = true
      break
    }
  }


  return {
    pass,
    message: () => `Expected ${this.utils.printReceived(clone(exp))} to be depply equal to ${got.map((got) => this.utils.printExpected(clone(got))).join(" or ")}`,
  }
}


expect.extend({
  ...expectOrdered,
  eq,
  inOrder(exp: any[], got) {
    if (exp[sym] === undefined) {
      exp[sym] = {arr: [...exp], counter: 0}
      expect.assertions(exp.length)
    }
    const { arr } = exp[sym]
    const empty = exp.length === 0
    const curVal = exp.shift()
    
    const counterIndex = exp[sym].counter
    exp[sym].counter++
    const counter = exp[sym].counter
    
    return {
      pass: !empty && circularDeepEqual(clone(curVal), clone(got)),
      message: () => `Expected checks in the following succession [${arr.map((e, i) => i < counterIndex ? this.utils.printExpected(e) : i === counterIndex ? this.utils.printReceived(got) : stringify(e)).join(", ")}].\nInstead of \n${this.utils.printReceived(got)}\n${this.utils.printExpected(curVal)}\nwas expected at the ${toOrdinal(counter)} invocation.`,
    }
  }
  
})



const sym = Symbol()