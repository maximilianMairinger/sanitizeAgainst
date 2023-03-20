import saniObj, { AND, OR, NOT } from "../../app/src/saniObj"
import { expect } from "./mockJest"


expect(saniObj({})({})).eq({})
    expect(saniObj({test: "test"})({})).eq({test: "test"})
    expect(saniObj({})(null)).eq({})
    expect(saniObj({test: "test"})(null)).eq({test: "test"})

console.log("done")