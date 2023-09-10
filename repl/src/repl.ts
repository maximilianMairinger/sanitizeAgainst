import sani, { AND, OR, NOT, AWAITED } from "../../app/src/sanitizeAgainst"
import { expect } from "./mockJest"



(async () => {
    let against = sani(new OR(new AWAITED(Number), String))



    let eee = await against(Promise.resolve(2))
})()
