import sani, { AND, OR, NOT, AWAITED, ensure, OBJECT } from "../../app/src/sanitizeAgainst"
import { expect } from "./mockJest"



(async () => {

  let against = sani(new OR(new AWAITED(Number), String))

  // expect(against(Promise.resolve(3))).toBeInstanceOf(Promise)
  expect(against("asd")).toBeInstanceOf(Promise)
  // expect(await against(Promise.resolve(3))).eq(3)
  // expect(async () => await against(4)).rejects.toThrow()
  // expect(async () => await against(Promise.resolve("qwe"))).rejects.toThrow()
  // expect(await against("asd")).eq("asd")
  
})()
