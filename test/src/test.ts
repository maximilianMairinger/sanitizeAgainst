import saniObj, { AND, OR, NOT } from "../../app/src/saniObj"
import "./extend"




describe("core", () => {
  
  test("spesific boolean default type", () => {
    expect(saniObj(false)(undefined)).eq(false)
    expect(saniObj(true)(undefined)).eq(true)
    expect(saniObj(false)(null)).eq(false)
    expect(saniObj(true)(null)).eq(true)
  })

  test("spesific boolean default type with spesific value", () => {
    expect(saniObj(false)(true)).eq(true)
    expect(saniObj(true)(false)).eq(false)

    expect(() => saniObj(false)(2)).toThrow()
    expect(() => saniObj(false)({})).toThrow()
    expect(() => saniObj(false)([])).toThrow()
    expect(() => saniObj(false)("")).toThrow()
    expect(() => saniObj(false)(" ")).toThrow()
    expect(() => saniObj(false)("false")).toThrow()
  })
  
  test("Unspesific boolean requirement default", () => {
    expect(() => saniObj(Boolean)(undefined)).toThrow()
    expect(() => saniObj(Boolean)(null)).toThrow()
  })

  test("Unspesific boolean requirement with spesific value", () => {
    expect(saniObj(Boolean)(true)).eq(true)
    expect(saniObj(Boolean)(false)).eq(false)

    expect(() => saniObj(Boolean)(2)).toThrow()
    expect(() => saniObj(Boolean)({})).toThrow()
    expect(() => saniObj(Boolean)([])).toThrow()
    expect(() => saniObj(Boolean)("")).toThrow()
    expect(() => saniObj(Boolean)(" ")).toThrow()
    expect(() => saniObj(Boolean)("false")).toThrow()
  })


  test("spesific number default type", () => {
    expect(saniObj(0)(undefined)).eq(0)
    expect(saniObj(2021)(undefined)).eq(2021)
    expect(saniObj(0)(null)).eq(0)
    expect(saniObj(2021)(null)).eq(2021)
  })

  test("spesific number default type with spesific value", () => {
    expect(saniObj(0)(2)).eq(2)
    expect(saniObj(2021)(2)).eq(2)

    expect(() => saniObj(0)(true)).toThrow()
    expect(() => saniObj(2021)(false)).toThrow()
    expect(() => saniObj(0)({})).toThrow()
    expect(() => saniObj(0)([])).toThrow()
    expect(() => saniObj(0)("")).toThrow()
    expect(() => saniObj(0)(" ")).toThrow()
    expect(() => saniObj(0)("false")).toThrow()
  })

  test("Unspesific number requirement default", () => {
    expect(() => saniObj(Number)(undefined)).toThrow()
    expect(() => saniObj(Number)(null)).toThrow()
  })

  test("Unspesific number requirement with spesific value", () => {
    expect(saniObj(Number)(2)).eq(2)

    expect(() => saniObj(Number)(true)).toThrow()
    expect(() => saniObj(Number)(false)).toThrow()
    expect(() => saniObj(Number)({})).toThrow()
    expect(() => saniObj(Number)([])).toThrow()
    expect(() => saniObj(Number)("")).toThrow()
    expect(() => saniObj(Number)(" ")).toThrow()
    expect(() => saniObj(Number)("false")).toThrow()
  })

  test("spesific string default type", () => {
    expect(saniObj("")("")).eq("")
    expect(saniObj("test")("")).eq("")
    expect(saniObj("")(null)).eq("")
    expect(saniObj("test")(null)).eq("test")
  })

  test("spesific string default type with spesific value", () => {
    expect(saniObj("")("test")).eq("test")
    expect(saniObj("test")("test")).eq("test")

    expect(() => saniObj("")(true)).toThrow()
    expect(() => saniObj("test")(false)).toThrow()
    expect(() => saniObj("")(2)).toThrow()
    expect(() => saniObj("")({})).toThrow()
    expect(() => saniObj("")([])).toThrow()
  })

  test("Unspesific string requirement default", () => {
    expect(() => saniObj(String)(undefined)).toThrow()
    expect(() => saniObj(String)(null)).toThrow()
  })

  test("Unspesific string requirement with spesific value", () => {
    expect(saniObj(String)("test")).eq("test")

    expect(() => saniObj(String)(true)).toThrow()
    expect(() => saniObj(String)(false)).toThrow()
    expect(() => saniObj(String)(2)).toThrow()
    expect(() => saniObj(String)({})).toThrow()
    expect(() => saniObj(String)([])).toThrow()
  })

  test("spesific object default type", () => {
    expect(saniObj({})({})).eq({})
    expect(saniObj({test: "test"})({})).eq({test: "test"})
    expect(saniObj({})(null)).eq({})
    expect(saniObj({test: "test"})(null)).eq({test: "test"})
  })

  test("spesific object default type with spesific value", () => {
    expect(saniObj({})({test: "test"})).eq({})
    expect(saniObj({test: "test"})({test: "test"})).eq({test: "test"})

    expect(() => saniObj({})("test")).toThrow()
    expect(() => saniObj({test: "test"})("test")).toThrow()
    expect(saniObj({test: "test"})({})).eq({test: "test"})
    expect(() => saniObj({})([])).toThrow()
    expect(() => saniObj({test: "test"})([])).toThrow()
  })

  test("Unspesific object requirement default", () => {
    expect(() => saniObj(Object)(undefined)).toThrow()
    expect(() => saniObj(Object)(null)).toThrow()
  })

  test("Unspesific object requirement with spesific value", () => {
    expect(saniObj(Object)({test: "test"})).eq({test: "test"})

    expect(() => saniObj(Object)("test")).toThrow()
    expect(() => saniObj(Object)([])).toThrow()
  })

  test("function requirement default", () => {
    expect(saniObj((input) => {return 2})()).eq(2)
    expect(saniObj((input) => {return 2})("test")).eq(2)
    expect(saniObj((input) => {return 2})({})).eq(2)
    expect(saniObj((input) => {return 2})([])).eq(2)
    expect(saniObj((input) => {return 2})(null)).eq(2)
    expect(saniObj((input) => {return 2})(undefined)).eq(2)

    expect(saniObj((input) => {return "test"})()).eq("test")
    expect(saniObj((input) => {return "test"})("test")).eq("test")
    expect(saniObj((input) => {return "test"})({})).eq("test")
    expect(saniObj((input) => {return "test"})([])).eq("test")
    expect(saniObj((input) => {return "test"})(null)).eq("test")
    expect(saniObj((input) => {return "test"})(undefined)).eq("test")

    let against = saniObj((input) => {
      if (input < 3) throw new Error("input is less than 3")
      return input
    })

    expect(against(3)).eq(3)
    expect(against(4)).eq(4)
    expect(against(5)).eq(5)
    expect(() => against(2)).toThrow()
    expect(() => against(1)).toThrow()
    expect(() => against(0)).toThrow()
    expect(() => against(-1)).toThrow()
    expect(against("asd")).eq("asd")
  })

  describe("Logical combinators", () => {
    test("logical or spesific", () => {
      expect(saniObj(new OR(String, 2, 2021, true))("")).eq("")
      expect(saniObj(new OR(String, 2, 2021, true))("lelqwle")).eq("lelqwle")
      expect(saniObj(new OR(String, 2, 2021, true))(2)).eq(2)
      expect(saniObj(new OR(String, 2, 2021, true))(2021)).eq(2021)
      expect(saniObj(new OR(String, 2, 2021, true))(true)).eq(true)
      expect(saniObj(new OR(String, 2, 2021, true))(null)).eq(2)
      expect(saniObj(new OR(String, 2, 2021, true))(undefined)).eq(2)
  
      expect(() => saniObj(new OR(String, 2, 2021, true))({})).toThrow()
      expect(() => saniObj(new OR(String, 2, 2021, true))([])).toThrow()
      expect(saniObj(new OR(String, 2, 2021, true))(false)).eq(false)
      expect(saniObj(new OR(String, 2, 2021, true))(2022)).eq(2022)
    })
  
    test("logical and spesific", () => {
      let against = saniObj(new AND(Number, (number) => {
        if (number < 3) throw new Error("input is less than 3")
        return number
      }))

      expect(against(3)).eq(3)
      expect(against(4)).eq(4)
      expect(against(5)).eq(5)
      expect(() => against(2)).toThrow()
      expect(() => against(1)).toThrow()
      expect(() => against(0)).toThrow()
      expect(() => against(-1)).toThrow()
      expect(() => against("asd")).toThrow()
      expect(() => against("3")).toThrow()
      expect(() => against(false)).toThrow()
    })

    test("logical and default is last priority", () => {
      let against = saniObj(new AND((number) => {
        if (number < 3) throw new Error("input is less than 3")
        return number
      }, Number, (input) => {
        return 5
      }))

      expect(against(3)).eq(5)
      expect(against(4)).eq(5)
      expect(against(5)).eq(5)
      expect(() => against(2)).toThrow()
      expect(() => against(1)).toThrow()
      expect(() => against(0)).toThrow()
      expect(() => against(-1)).toThrow()
      expect(() => against("asd")).toThrow()
      expect(() => against("3")).toThrow()
      expect(() => against(false)).toThrow()
    })

    test("logical and chain forwards last result and doesnt take original input", () => {
      let against = saniObj(new AND((number) => {
        if (number < 3) throw new Error("input is less than 3")
        return "abc"
      }, Number))

      expect(() => against(3)).toThrow()
      expect(() => against(4)).toThrow()
      expect(() => against(5)).toThrow()
      expect(() => against(2)).toThrow()
      expect(() => against(1)).toThrow()
      expect(() => against(0)).toThrow()
      expect(() => against(-1)).toThrow()
      expect(() => against("asd")).toThrow()


    })

    test("logical not", () => {
      expect(() => saniObj(new NOT(String))("")).toThrow()
      expect(() => saniObj(new NOT(String))("lelqwle")).toThrow()
      expect(saniObj(new NOT(String))(2)).eq(2)
      expect(saniObj(new NOT(String))(2021)).eq(2021)
      expect(saniObj(new NOT(String))(true)).eq(true)
      expect(saniObj(new NOT(String))(null)).eq(null)
      expect(saniObj(new NOT(String))(undefined)).eq(undefined)
    })

    test("logical or & and combination", () => {
      let against = saniObj(new OR(new AND(Number, (number) => {
        if (number < 3) throw new Error("input is less than 3")
        return number
      }), Boolean))

      expect(against(3)).eq(3)
      expect(against(4)).eq(4)
      expect(against(5)).eq(5)
      expect(() => against(2)).toThrow()
      expect(() => against(1)).toThrow()
      expect(() => against(0)).toThrow()
      expect(() => against(-1)).toThrow()
      expect(() => against("asd")).toThrow()
      expect(() => against("3")).toThrow()
      expect(against(false)).eq(false)
      expect(against(true)).eq(true)
    })  

    test("logical and & not combination", () => {
      let against = saniObj(new AND(new NOT(String), (i) => {if (i === 2) throw new Error(); return i}))

      expect(against(3)).eq(3)
      expect(against(4)).eq(4)
      expect(against(5)).eq(5)
      expect(() => against(2)).toThrow()
      expect(against(1)).eq(1)
      expect(against(0)).eq(0)
      expect(against(-1)).eq(-1)
      expect(() => against("asd")).toThrow()
      expect(() => against("3")).toThrow()
      expect(against(false)).eq(false)
      expect(against(true)).eq(true)
    })

    test("logical not & function", () => {
      let against = saniObj(new NOT((i) => {if (i === 2) throw new Error(); return i}))

      expect(() => against(3)).toThrow()
      expect(() => against(4)).toThrow()
      expect(() => against(5)).toThrow()
      expect(against(2)).eq(2)
      expect(() => against(1)).toThrow()
      expect(() => against(0)).toThrow()
      expect(() => against(-1)).toThrow()
      expect(() => against("asd")).toThrow()
      expect(() => against("3")).toThrow()
      expect(() => against(false)).toThrow()
      expect(() => against(true)).toThrow()
    })
  })

  

  

  describe("Nested objects", () => {
    test("Nested object required unspesific default", () => {
      let against = saniObj({
        test: {
          lel: Number,
          qwe: String
        }
      })

      expect(against({test: {lel: 2, qwe: "asd"}})).eq({test: {lel: 2, qwe: "asd"}})
      expect(() => against({test: {lel: 2, qwe: 2}})).toThrow()
      expect(() => against({test: {lel: "asd", qwe: "asd"}})).toThrow()
      expect(against({test: {lel: 2, qwe: "asd", asd: "asd"}})).eq({test: {lel: 2, qwe: "asd"}})
      expect(() => against({test: {lel: 2}})).toThrow()
      expect(() => against({test: {qwe: "asd"}})).toThrow()
      expect(() => against({test: {asd: "asd"}})).toThrow()
      expect(() => against({test: {}})).toThrow()
      expect(() => against()).toThrow()
      expect(() => against(undefined)).toThrow()
      expect(() => against(null)).toThrow()
    })

    test("Nested object required spesific default", () => {
      let against = saniObj({
        test: {
          lel: 2,
          qwe: "asd"
        },
        test2: {
          lel: Number,
          qwe: String
        }
      })

      expect(against({test: {lel: 3, qwe: "www"}, test2: {lel: 2, qwe: "asd2"}})).eq({test: {lel: 3, qwe: "www"}, test2: {lel: 2, qwe: "asd2"}})
      expect(() => against({test: {lel: 2, qwe: "www"}, test2: {lel: 2, qwe: 2}})).toThrow()
      expect(() => against({test: {lel: 2, qwe: "www"}, test2: {lel: "www", qwe: "www"}})).toThrow()

      expect(against({test2: {lel: 2, qwe: "www"}})).eq({test: {lel: 2, qwe: "asd"}, test2: {lel: 2, qwe: "www"}})
      expect(() => against({test2: {lel: 2, qwe: 2}})).toThrow()
      expect(() => against({test2: {lel: "www", qwe: "www"}})).toThrow()

      expect(against({test1: {}, test2: {lel: 3, qwe: "qwe"}})).eq({test: {lel: 2, qwe: "asd"}, test2: {lel: 3, qwe: "qwe"}})
      expect(() => against({test1: {}})).toThrow()

      expect(against({test: {lel: 4}, test2: {lel: 3, qwe: "qwe"}})).eq({test: {lel: 4, qwe: "asd"}, test2: {lel: 3, qwe: "qwe"}})
      expect(() => against({test: {lel: 4}, test2: {lel: 3, qwe: 2}})).toThrow()
    })

    test("Nested object optional unspesific default", () => {
      let against = saniObj({
        "test?": {
          lel: Number,
          qwe: String
        }
      })

      expect(against({test: {lel: 2, qwe: "asd"}})).eq({test: {lel: 2, qwe: "asd"}})
      expect(() => against({test: {lel: 2, qwe: 2}})).toThrow()
      expect(() => against({test: {lel: "asd", qwe: "asd"}})).toThrow()
      expect(against({test: {lel: 2, qwe: "asd", asd: "asd"}})).eq({test: {lel: 2, qwe: "asd"}})
      expect(() => against({test: {lel: 2}})).toThrow()
      expect(() => against({test: {qwe: "asd"}})).toThrow()
      expect(() => against({test: {asd: "asd"}})).toThrow()
      expect(() => against({test: {}})).toThrow()
      expect(against({})).eq({})
      expect(against(undefined)).eq({})
      expect(against(null)).eq({})
      expect(against()).eq({})
    })

    test("Nested object optional spesific default", () => {
      let against = saniObj({
        "test?": {
          lel: 2,
          qwe: String
        }
      })

      expect(against({test: {lel: 4, qwe: "asd"}})).eq({test: {lel: 4, qwe: "asd"}})
      expect(() => against({test: {lel: 4, qwe: 2}})).toThrow()
      expect(against({test: {lel: 4, qwe: "asd", asd: "asd"}})).eq({test: {lel: 4, qwe: "asd"}})
      expect(() => against({test: {lel: 4}})).toThrow()
      expect(against({test: {qwe: "asd"}})).eq({test: {lel: 2, qwe: "asd"}})
      expect(() => against({test: {asd: "asd"}})).toThrow()
      expect(() => against({test: {}})).toThrow()
      expect(against({})).eq({})
      expect(against()).eq({})
    })

    test("Object key with unspesific default but optional", () => {
      expect(saniObj({"lel?": Number})({})).eq({})
      expect(saniObj({"lel?": Number})({lel: 2})).eq({lel: 2})
      expect(() => saniObj({"lel?": Number})({lel: "asd"})).toThrow()
      expect(saniObj({"lel?": Number})({lel: 2, qwe: 2})).eq({lel: 2})
      expect(saniObj({"lel?": Number})({lel: 2, qwe: "asd"})).eq({lel: 2})
      expect(() => saniObj({"lel?": Number})({lel: "asd", qwe: "asd"})).toThrow()
      expect(() => saniObj({"lel?": Number})({lel: "asd", qwe: 2})).toThrow()
      expect(saniObj({"lel?": Number})({qwe: 2})).eq({})
      expect(saniObj({"lel?": Number})({qwe: "asd"})).eq({})
    })

    test("Object key with spesific default and optional", () => {
      expect(saniObj({"lel?": 2})({})).eq({})
      expect(saniObj({"lel?": 2})({lel: 4})).eq({lel: 4})
      expect(() => saniObj({"lel?": 2})({lel: "asd"})).toThrow()
      expect(saniObj({"lel?": 2})({lel: 4, qwe: 2})).eq({lel: 4})
      expect(saniObj({"lel?": 2})({lel: 3, qwe: "asd"})).eq({lel: 3})
      expect(() => saniObj({"lel?": 2})({lel: "asd", qwe: "asd"})).toThrow()
      expect(() => saniObj({"lel?": 2})({lel: "asd", qwe: 2})).toThrow()
      expect(saniObj({"lel?": 2})({qwe: 2})).eq({})
      expect(saniObj({"lel?": 2})({qwe: "asd"})).eq({})
      expect(saniObj({"lel?": 2})({lel: undefined})).eq({lel: 2})
      expect(saniObj({"lel?": 2})({lel: null})).eq({lel: 2})
    })


    test("Nested object with logical and", () => {
      let against = saniObj({
        "test?": new AND(Number, (inp) => {
          if (inp < 3) throw new Error("asd")
          else return inp
        }) 
      })

      expect(() => against({test: 2})).toThrow()
      expect(against({test: 3})).eq({test: 3})
      expect(against({test: 4})).eq({test: 4})
      expect(() => against({test: "asd"})).toThrow()
      expect(() => against({test: 2, qwe: 2})).toThrow()
      expect(() => against({test: 2, qwe: "asd"})).toThrow()
      expect(() => against({test: "asd", qwe: "asd"})).toThrow()
      expect(() => against({test: "asd", qwe: 2})).toThrow()
      expect(against({})).eq({})
      expect(against({qwe: 2})).eq({})
    })

    test("Nested object with logical or", () => {
      let against = saniObj({
        "test?": new OR(Number, String)
      })

      expect(against({test: 2})).eq({test: 2})
      expect(against({test: 3})).eq({test: 3})
      expect(against({test: 4})).eq({test: 4})
      expect(against({test: "asd"})).eq({test: "asd"})
      expect(against({test: 2, qwe: 2})).eq({test: 2})
      expect(against({test: 2, qwe: "asd"})).eq({test: 2})
      expect(against({})).eq({})
      expect(against({qwe: 2})).eq({})
    })

    test("Nested object with required logical or", () => {
      let against = saniObj({
        "test": new OR(Number, String)
      })

      expect(against({test: 2})).eq({test: 2})
      expect(against({test: 3})).eq({test: 3})
      expect(against({test: 4})).eq({test: 4})
      expect(against({test: "asd"})).eq({test: "asd"})
      expect(against({test: 2, qwe: 2})).eq({test: 2})
      expect(against({test: 2, qwe: "asd"})).eq({test: 2})
      expect(() => against({})).toThrow()
      expect(() => against({qwe: 2})).toThrow()
    })


    test("Nested object with logical or with nested ob inside", () => {
      let against = saniObj({
        "test?": new OR(Number, {
          asd: String
        })
      })

      expect(against({test: 2})).eq({test: 2})
      expect(against({test: 3})).eq({test: 3})
      expect(against({test: 4})).eq({test: 4})
      expect(against({test: {asd: "asd"}})).eq({test: {asd: "asd"}})
      expect(against({test: 2, qwe: 2})).eq({test: 2})
      expect(against({test: 2, qwe: "asd"})).eq({test: 2})
      expect(against({})).eq({})
      expect(against({qwe: 2})).eq({})

      expect(() => against({test: {asd: 2}})).toThrow()
      expect(() => against({test: {asd: 2, qwe: 2}})).toThrow()
      expect(() => against({test: {asd: 2, qwe: "asd"}})).toThrow()
      expect(against({test: {asd: "asd", qwe: 2}})).eq({test: {asd: "asd"}})
    })


    test("escape optional char", () => {
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

      let against4 = saniObj({
        "test?????": Number
      })

      expect(against4({"test??": 2})).eq({"test??": 2})
      expect(() => against4({"test??": "asd"})).toThrow()
      expect(against4({"test??": 2, qwe: 2})).eq({"test??": 2})
      expect(against4({"test??": 2, qwe: "asd"})).eq({"test??": 2})
      expect(() => against4({"test??": "asd", qwe: "asd"})).toThrow()
      expect(() => against4({"test??": "asd", qwe: 2})).toThrow()
      expect(against4({})).eq({})
      expect(against4({qwe: 2})).eq({})

      let against5 = saniObj({
        "test??????": Number
      })

      expect(against5({"test???": 2})).eq({"test???": 2})
      expect(() => against5({"test???": "asd"})).toThrow()
      expect(against5({"test???": 2, qwe: 2})).eq({"test???": 2})
      expect(against5({"test???": 2, qwe: "asd"})).eq({"test???": 2})
      expect(() => against5({"test???": "asd", qwe: "asd"})).toThrow()
      expect(() => against5({"test???": "asd", qwe: 2})).toThrow()
      expect(() => against5({})).toThrow()
      expect(() => against5({qwe: 2})).toThrow()

      let against6 = saniObj({
        "test???????": Number
      })

      expect(against6({"test???": 2})).eq({"test???": 2})
      expect(() => against6({"test???": "asd"})).toThrow()
      expect(against6({"test???": 2, qwe: 2})).eq({"test???": 2})
      expect(against6({"test???": 2, qwe: "asd"})).eq({"test???": 2})
      expect(() => against6({"test???": "asd", qwe: "asd"})).toThrow()
      expect(() => against6({"test???": "asd", qwe: 2})).toThrow()
      expect(against6({})).eq({})
      expect(against6({qwe: 2})).eq({})
    })
  })

  test("__proto__ filter normal", () => {
    const input1 = Object.create(null)
    input1.__proto__ = 2

    expect(saniObj({lel: 2})(input1)).eq({lel: 2})
    expect(saniObj({})(input1)).eq({})

    let o = {}
    expect(o.__proto__).eq(Object.prototype)
  })

  test("__proto__ is cought unspesific default", () => {
    const pattern = Object.create(null)
    pattern.__proto__ = Number
    let against = saniObj(pattern)

    const expected = {} as any
    Object.defineProperty(expected, "__proto__", {value: 2, writable: true, enumerable: true})


    const input1 = {} as any
    Object.defineProperty(input1, "__proto__", {value: 2, writable: true, enumerable: true})
    const input2 = {} as any
    Object.defineProperty(input2, "__proto__", {value: "asd", writable: true, enumerable: true})
    const input3 = {} as any
    Object.defineProperty(input3, "__proto__", {value: 2, writable: true, enumerable: true})
    Object.defineProperty(input3, "qwe", {value: 2, writable: true, enumerable: true})
    const input4 = {} as any
    Object.defineProperty(input4, "__proto__", {value: 2, writable: true, enumerable: true})
    Object.defineProperty(input4, "qwe", {value: "asd", writable: true, enumerable: true})
    const input5 = {} as any
    Object.defineProperty(input5, "__proto__", {value: "asd", writable: true, enumerable: true})
    Object.defineProperty(input5, "qwe", {value: "asd", writable: true, enumerable: true})
    const input6 = {} as any
    Object.defineProperty(input6, "__proto__", {value: "asd", writable: true, enumerable: true})
    Object.defineProperty(input6, "qwe", {value: 2, writable: true, enumerable: true})
    const input7 = {} as any
    const input8 = {} as any
    Object.defineProperty(input8, "qwe", {value: 2, writable: true, enumerable: true})


    expect(against(input1)).eq(expected)
    expect(() => against(input2)).toThrow()
    expect(against(input3)).eq(expected)
    expect(against(input4)).eq(expected)
    expect(() => against(input5)).toThrow()
    expect(() => against(input6)).toThrow()
    expect(() => against({})).toThrow()
    expect(() => against(input7)).toThrow()
    expect(() => against(input8)).toThrow()


    let o = {}
    expect(o.__proto__).eq(Object.prototype)
  })

  


  test("__proto__ is cought spesific default", () => {
    const pattern = Object.create(null)
    pattern.__proto__ = 4
    let against = saniObj(pattern)

    const expectedDefault = {} as any
    expectedDefault.__proto__ = 4
    Object.defineProperty(expectedDefault, "__proto__", {value: 4, writable: true, enumerable: true})

    const expected = {} as any
    expected.__proto__ = 2
    Object.defineProperty(expected, "__proto__", {value: 2, writable: true, enumerable: true})

    const input1 = {} as any
    Object.defineProperty(input1, "__proto__", {value: 2, writable: true, enumerable: true})
    const input2 = {} as any
    Object.defineProperty(input2, "__proto__", {value: "asd", writable: true, enumerable: true})
    const input3 = {} as any
    Object.defineProperty(input3, "__proto__", {value: 2, writable: true, enumerable: true})
    Object.defineProperty(input3, "qwe", {value: 2, writable: true, enumerable: true})
    const input4 = {} as any
    Object.defineProperty(input4, "__proto__", {value: 2, writable: true, enumerable: true})
    Object.defineProperty(input4, "qwe", {value: "asd", writable: true, enumerable: true})
    const input5 = {} as any
    Object.defineProperty(input5, "__proto__", {value: "asd", writable: true, enumerable: true})
    Object.defineProperty(input5, "qwe", {value: "asd", writable: true, enumerable: true})
    const input6 = {} as any
    Object.defineProperty(input6, "__proto__", {value: "asd", writable: true, enumerable: true})
    Object.defineProperty(input6, "qwe", {value: 2, writable: true, enumerable: true})
    const input7 = {} as any
    const input8 = {} as any
    Object.defineProperty(input7, "qwe", {value: 2, writable: true, enumerable: true})



    expect(against(input1)).eq(expected)
    expect(() => against(input2)).toThrow()
    expect(against(input3)).eq(expected)
    expect(against(input4)).eq(expected)
    expect(() => against(input5)).toThrow()
    expect(() => against(input6)).toThrow()
    expect(against({})).eq(expectedDefault)
    expect(against(input7)).eq(expectedDefault)
    expect(against(input8)).eq(expectedDefault)


    let o = {}
    expect(o.__proto__).eq(Object.prototype)
  })


})

