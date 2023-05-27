import sani, { AND, OR, NOT } from "../../app/src/sanitizeAgainst"
import { expect } from "./mockJest"


expect(sani({})({})).eq({})
    expect(sani({test: "test"})({})).eq({test: "test"})
    expect(sani({})(null)).eq({})
    expect(sani({test: "test"})(null)).eq({test: "test"})

console.log("done")