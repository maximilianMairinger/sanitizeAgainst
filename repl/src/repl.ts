import sani, { AND, OR, NOT, AWAITED, ensure, OBJECT } from "../../app/src/sanitizeAgainst"
import { expect } from "./mockJest"



(async () => {

  const a = sani(new OBJECT(Boolean, false, true))
    
  expect(a({
    lel1: false,
    lel2: {
      lel: true
    }
  })).eq({
    lel1: false,
    lel2: {
      lel: true
    }
  })
  
})()
