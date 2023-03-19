import saniObj, { AND, OR, NOT } from "../../app/src/saniObj"
import { expect } from "./mockJest"

let against = saniObj({
  "test??": Number
})

expect(against({"test?": 2})).eq({"test?": 2})
expect(() => against({"test?": "asd"})).toThrow()
expect(against({"test?": 2, qwe: 2})).eq({"test?": 2})
expect(against({"test?": 2, qwe: "asd"})).eq({"test?": 2})
expect(() => against({"test?": "asd", qwe: "asd"})).toThrow()
expect(() => against({"test?": "asd", qwe: 2})).toThrow()
expect(() => against({})).toThrow()
expect(() => against({qwe: 2})).toThrow()

let against2 = saniObj({
  "test???": Number
})

expect(against2({"test?": 2})).eq({"test?": 2})
expect(() => against2({"test?": "asd"})).toThrow()
expect(against2({"test?": 2, qwe: 2})).eq({"test?": 2})
expect(against2({"test?": 2, qwe: "asd"})).eq({"test?": 2})
expect(() => against2({"test?": "asd", qwe: "asd"})).toThrow()
expect(() => against2({"test?": "asd", qwe: 2})).toThrow()
expect(against2({})).eq({})
expect(against2({qwe: 2})).eq({})    

let against3 = saniObj({
  "test????": Number
})

expect(against3({"test??": 2})).eq({"test??": 2})
expect(() => against3({"test??": "asd"})).toThrow()
expect(against3({"test??": 2, qwe: 2})).eq({"test??": 2})
expect(against3({"test??": 2, qwe: "asd"})).eq({"test??": 2})
expect(() => against3({"test??": "asd", qwe: "asd"})).toThrow()
expect(() => against3({"test??": "asd", qwe: 2})).toThrow()
expect(() => against3({})).toThrow()
expect(() => against3({qwe: 2})).toThrow()



console.log("done")