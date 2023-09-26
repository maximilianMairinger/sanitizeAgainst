import sani, { AND, OR, NOT, AWAITED, ensure, OBJECT } from "../../app/src/sanitizeAgainst"
import { expect } from "./mockJest"



(async () => {

  const a = sani(new OBJECT(new OR(Boolean, Number, String), false, true))
    
  a(new Promise(() => {}))
  
})()
