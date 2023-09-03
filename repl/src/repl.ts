import sani, { AND, OR, NOT, AWAITED } from "../../app/src/sanitizeAgainst"
import { expect } from "./mockJest"




const ob = {lel: new Promise<number>((res) => {
    setTimeout(() => {
        res("5")
    }, 1000)
})}

let lel = sani({lel: new AWAITED(2), kek: 2, "qwe?": String})(ob)




