import sani, { AND, OR, NOT, AWAITED, OBJECT, ensure, stringStartsWith, numberLikeStringPattern } from "../../app/src/sanitizeAgainst"
import "./extend"




describe("core", () => {
  
  test("spesific boolean default type", () => {
    expect(sani(false)(undefined)).eq(false)
    expect(sani(true)(undefined)).eq(true)
    expect(sani(false)(null)).eq(false)
    expect(sani(true)(null)).eq(true)
  })

  test("spesific boolean default type with spesific value", () => {
    expect(sani(false)(true)).eq(true)
    expect(sani(true)(false)).eq(false)

    expect(() => sani(false)(2)).toThrow()
    expect(() => sani(false)({})).toThrow()
    expect(() => sani(false)([])).toThrow()
    expect(() => sani(false)("")).toThrow()
    expect(() => sani(false)(" ")).toThrow()
    expect(() => sani(false)("false")).toThrow()
  })
  
  test("Unspesific boolean requirement default", () => {
    expect(() => sani(Boolean)(undefined)).toThrow()
    expect(() => sani(Boolean)(null)).toThrow()
  })

  test("Unspesific boolean requirement with spesific value", () => {
    expect(sani(Boolean)(true)).eq(true)
    expect(sani(Boolean)(false)).eq(false)

    expect(() => sani(Boolean)(2)).toThrow()
    expect(() => sani(Boolean)({})).toThrow()
    expect(() => sani(Boolean)([])).toThrow()
    expect(() => sani(Boolean)("")).toThrow()
    expect(() => sani(Boolean)(" ")).toThrow()
    expect(() => sani(Boolean)("false")).toThrow()
  })


  test("spesific number default type", () => {
    expect(sani(0)(undefined)).eq(0)
    expect(sani(2021)(undefined)).eq(2021)
    expect(sani(0)(null)).eq(0)
    expect(sani(2021)(null)).eq(2021)
  })

  test("spesific number default type with spesific value", () => {
    expect(sani(0)(2)).eq(2)
    expect(sani(2021)(2)).eq(2)

    expect(() => sani(0)(true)).toThrow()
    expect(() => sani(2021)(false)).toThrow()
    expect(() => sani(0)({})).toThrow()
    expect(() => sani(0)([])).toThrow()
    expect(() => sani(0)("")).toThrow()
    expect(() => sani(0)(" ")).toThrow()
    expect(() => sani(0)("false")).toThrow()
  })

  test("Unspesific number requirement default", () => {
    expect(() => sani(Number)(undefined)).toThrow()
    expect(() => sani(Number)(null)).toThrow()
  })

  test("Unspesific number requirement with spesific value", () => {
    expect(sani(Number)(2)).eq(2)

    expect(() => sani(Number)(true)).toThrow()
    expect(() => sani(Number)(false)).toThrow()
    expect(() => sani(Number)({})).toThrow()
    expect(() => sani(Number)([])).toThrow()
    expect(() => sani(Number)("")).toThrow()
    expect(() => sani(Number)(" ")).toThrow()
    expect(() => sani(Number)("false")).toThrow()
  })

  test("spesific string default type", () => {
    expect(sani("")("")).eq("")
    expect(sani("test")("")).eq("")
    expect(sani("")(null)).eq("")
    expect(sani("test")(null)).eq("test")
  })

  test("spesific string default type with spesific value", () => {
    expect(sani("")("test")).eq("test")
    expect(sani("test")("test")).eq("test")

    expect(() => sani("")(true)).toThrow()
    expect(() => sani("test")(false)).toThrow()
    expect(() => sani("")(2)).toThrow()
    expect(() => sani("")({})).toThrow()
    expect(() => sani("")([])).toThrow()
  })

  test("Unspesific string requirement default", () => {
    expect(() => sani(String)(undefined)).toThrow()
    expect(() => sani(String)(null)).toThrow()
  })

  test("Unspesific string requirement with spesific value", () => {
    expect(sani(String)("test")).eq("test")

    expect(() => sani(String)(true)).toThrow()
    expect(() => sani(String)(false)).toThrow()
    expect(() => sani(String)(2)).toThrow()
    expect(() => sani(String)({})).toThrow()
    expect(() => sani(String)([])).toThrow()
  })

  test("spesific object default type", () => {
    expect(sani({})({})).eq({})
    expect(sani({test: "test"})({})).eq({test: "test"})
    expect(sani({})(null)).eq({})
    expect(sani({test: "test"})(null)).eq({test: "test"})
  })

  test("spesific object default type with spesific value", () => {
    expect(sani({})({test: "test"})).eq({})
    expect(sani({test: "test"})({test: "test"})).eq({test: "test"})

    expect(() => sani({})("test")).toThrow()
    expect(() => sani({test: "test"})("test")).toThrow()
    expect(sani({test: "test"})({})).eq({test: "test"})
    expect(() => sani({})([])).toThrow()
    expect(() => sani({test: "test"})([])).toThrow()
  })

  test("Unspesific object requirement default", () => {
    expect(() => sani(Object)(undefined)).toThrow()
    expect(() => sani(Object)(null)).toThrow()
  })

  test("Unspesific object requirement with spesific value", () => {
    expect(sani(Object)({test: "test"})).eq({test: "test"})

    expect(() => sani(Object)("test")).toThrow()
    expect(() => sani(Object)([])).toThrow()
  })

  test("function requirement default", () => {
    expect(sani((input) => {return 2})()).eq(2)
    expect(sani((input) => {return 2})("test")).eq(2)
    expect(sani((input) => {return 2})({})).eq(2)
    expect(sani((input) => {return 2})([])).eq(2)
    expect(sani((input) => {return 2})(null)).eq(2)
    expect(sani((input) => {return 2})(undefined)).eq(2)

    expect(sani((input) => {return "test"})()).eq("test")
    expect(sani((input) => {return "test"})("test")).eq("test")
    expect(sani((input) => {return "test"})({})).eq("test")
    expect(sani((input) => {return "test"})([])).eq("test")
    expect(sani((input) => {return "test"})(null)).eq("test")
    expect(sani((input) => {return "test"})(undefined)).eq("test")

    let against = sani((input) => {
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
      expect(sani(new OR(String, 2, 2021, true))("")).eq("")
      expect(sani(new OR(String, 2, 2021, true))("lelqwle")).eq("lelqwle")
      expect(sani(new OR(String, 2, 2021, true))(2)).eq(2)
      expect(sani(new OR(String, 2, 2021, true))(2021)).eq(2021)
      expect(sani(new OR(String, 2, 2021, true))(true)).eq(true)
      expect(sani(new OR(String, 2, 2021, true))(null)).eq(2)
      expect(sani(new OR(String, 2, 2021, true))(undefined)).eq(2)
  
      expect(() => sani(new OR(String, 2, 2021, true))({})).toThrow()
      expect(() => sani(new OR(String, 2, 2021, true))([])).toThrow()
      expect(sani(new OR(String, 2, 2021, true))(false)).eq(false)
      expect(sani(new OR(String, 2, 2021, true))(2022)).eq(2022)
    })
  
    test("logical and spesific", () => {
      let against = sani(new AND(Number, (number) => {
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
      let against = sani(new AND((number) => {
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
      let against = sani(new AND((number) => {
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
      expect(() => sani(new NOT(String))("")).toThrow()
      expect(() => sani(new NOT(String))("lelqwle")).toThrow()
      expect(sani(new NOT(String))(2)).eq(2)
      expect(sani(new NOT(String))(2021)).eq(2021)
      expect(sani(new NOT(String))(true)).eq(true)
      expect(sani(new NOT(String))(null)).eq(null)
      expect(sani(new NOT(String))(undefined)).eq(undefined)
    })

    test("logical or & and combination", () => {
      let against = sani(new OR(new AND(Number, (number) => {
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
      let against = sani(new AND(new NOT(String), (i) => {if (i === 2) throw new Error(); return i}))

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
      let against = sani(new NOT((i) => {if (i === 2) throw new Error(); return i}))

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

    describe("Combinator with awaited", () => {
      test("Or with one awaited 1", async () => {
        let against = sani(new OR(new AWAITED(Number), String))

        expect(against(Promise.resolve(3))).toBeInstanceOf(Promise)
        expect(against("asd")).toBeInstanceOf(Promise)
        expect(await against(Promise.resolve(3))).eq(3)
        expect(async () => await against(4)).rejects.toThrow()
        expect(async () => await against(Promise.resolve("qwe"))).rejects.toThrow()
        expect(await against("asd")).eq("asd")
      })

      test("Or with one awaited 2", async () => {
        let against = sani(new OR(String, new AWAITED(Number)))

        expect(against(Promise.resolve(3))).toBeInstanceOf(Promise)
        expect(against("asd")).toBeInstanceOf(Promise)
        expect(await against(Promise.resolve(3))).eq(3)
        expect(async () => await against(4)).rejects.toThrow()
        expect(async () => await against(Promise.resolve("qwe"))).rejects.toThrow()
        expect(await against("asd")).eq("asd")
      })


      test("Or with two awaited", async () => {
        let against = sani(new OR(new AWAITED(Number), new AWAITED(String)))

        expect(await against(Promise.resolve(3))).eq(3)
        expect(await against(Promise.resolve("qwe"))).eq("qwe")
        expect(async () => await against(Promise.resolve(false))).rejects.toThrow()
        expect(async () => await against(Promise.resolve(false))).rejects.toThrow()
        expect(async () => await against(4)).rejects.toThrow()
        expect(async () => await against("asd")).rejects.toThrow()
      })
    })
    
    describe("Combinator with arbitrary instance of", () => {
      test("And", async () => {
        const against1 = sani(new AND(Promise, (p) => p.then((e) => e + 1)))
        
        expect(against1(Promise.resolve(2))).toBeInstanceOf(Promise)
        expect(await against1(Promise.resolve(2))).eq(3)
        expect(await against1(Promise.resolve(3))).eq(4)
        expect(() => against1(2)).toThrow()
        expect(() => against1("asd")).toThrow()

        const against2 = sani(new AND(Promise, (p) => p.then((e) => {if (e !== "") throw new Error()})))
        expect(against2(Promise.resolve(""))).toBeInstanceOf(Promise)
        expect(await against2(Promise.resolve(""))).eq(undefined)
        expect(async () => await against2(Promise.resolve("asd"))).rejects.toThrow()
      })
    })
  })

  

  

  describe("Nested objects", () => {
    test("Nested object required unspesific default", () => {
      let against = sani({
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
      let against = sani({
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
      let against = sani({
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
      let against = sani({
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
      expect(sani({"lel?": Number})({})).eq({})
      expect(sani({"lel?": Number})({lel: 2})).eq({lel: 2})
      expect(() => sani({"lel?": Number})({lel: "asd"})).toThrow()
      expect(sani({"lel?": Number})({lel: 2, qwe: 2})).eq({lel: 2})
      expect(sani({"lel?": Number})({lel: 2, qwe: "asd"})).eq({lel: 2})
      expect(() => sani({"lel?": Number})({lel: "asd", qwe: "asd"})).toThrow()
      expect(() => sani({"lel?": Number})({lel: "asd", qwe: 2})).toThrow()
      expect(sani({"lel?": Number})({qwe: 2})).eq({})
      expect(sani({"lel?": Number})({qwe: "asd"})).eq({})
    })

    test("Object key with spesific default and optional", () => {
      expect(sani({"lel?": 2})({})).eq({})
      expect(sani({"lel?": 2})({lel: 4})).eq({lel: 4})
      expect(() => sani({"lel?": 2})({lel: "asd"})).toThrow()
      expect(sani({"lel?": 2})({lel: 4, qwe: 2})).eq({lel: 4})
      expect(sani({"lel?": 2})({lel: 3, qwe: "asd"})).eq({lel: 3})
      expect(() => sani({"lel?": 2})({lel: "asd", qwe: "asd"})).toThrow()
      expect(() => sani({"lel?": 2})({lel: "asd", qwe: 2})).toThrow()
      expect(sani({"lel?": 2})({qwe: 2})).eq({})
      expect(sani({"lel?": 2})({qwe: "asd"})).eq({})
      expect(sani({"lel?": 2})({lel: undefined})).eq({lel: 2})
      expect(sani({"lel?": 2})({lel: null})).eq({lel: 2})
    })


    test("Nested object with logical and", () => {
      let against = sani({
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
      let against = sani({
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
      let against = sani({
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
      let against = sani({
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
      let against = sani({
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

      let against2 = sani({
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

      let against3 = sani({
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

      let against4 = sani({
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

      let against5 = sani({
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

      let against6 = sani({
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

    expect(sani({lel: 2})(input1)).eq({lel: 2})
    expect(sani({})(input1)).eq({})

    let o = {}
    expect(o.__proto__).eq(Object.prototype)
  })

  test("__proto__ is cought unspesific default", () => {
    const pattern = Object.create(null)
    pattern.__proto__ = Number
    let against = sani(pattern)

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
    let against = sani(pattern)

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


  describe("Awaited", () => {
    test("Basic usage", async () => {
      expect.assertions(3)
      const a = sani(new AWAITED(Number))

      expect(a(Promise.resolve(2))).toBeInstanceOf(Promise)
      expect(await a(Promise.resolve(2))).eq(2)
      expect(await a(new Promise((res) => {
        setTimeout(() => {
          res(3)
        }, 10)
      }))).eq(3)

      
    })

    test("Catch basic error", async () => {
      const a = sani(new AWAITED(Number))
      expect.assertions(2)

      await expect(async () => await a(Promise.resolve("asd"))).rejects.toThrow()
      await expect(async () => await a(new Promise((res) => {
        setTimeout(() => {
          res("asd")
        }, 10)
      }))).rejects.toThrow()
    })


    test("Catch rejected error", async () => {
      const a = sani(new AWAITED(Number))
      expect.assertions(4)

      await expect(async () => await a(Promise.reject(new Error(2)))).rejects.toThrow()
      await expect(async () => await a(Promise.reject(new Error("asd")))).rejects.toThrow()
      await expect(async () => await a(new Promise((res, rej) => {
        setTimeout(() => {
          rej(new Error(2))
        }, 10)
      }))).rejects.toThrow()
      await expect(async () => await a(new Promise((res, rej) => {
        setTimeout(() => {
          rej(new Error("asd"))
        }, 10)
      }))).rejects.toThrow()
    })

    test("Nested Awaited", async () => {
      const a = sani(new AWAITED(new AWAITED(String)))
      expect.assertions(4)

      await expect(async () => await a(Promise.resolve(Promise.resolve(2)))).rejects.toThrow()
      await expect(async () => await a(Promise.resolve(2))).rejects.toThrow()
      expect(await a(Promise.resolve("asd"))).toEqual("asd")
      expect(await a(Promise.resolve(Promise.resolve("asd")))).toEqual("asd")
    })

    test("Awaited in object", async () => {
      const a = sani({
        test: new AWAITED(Number)
      })
      expect.assertions(3)

      expect(a({test: Promise.resolve(2)})).toBeInstanceOf(Object)
      expect(a({test: Promise.resolve(2)}).test).toBeInstanceOf(Promise)
      await expect(async () => await a({test: Promise.resolve("asd")}).test).rejects.toThrow()
    })

    test("Awaited in object in awaited", async () => {
      const a = sani({
        test: new AWAITED({
          test2: new AWAITED(Number)
        })
      })
      expect.assertions(2)

      expect(await (await a({test: Promise.resolve({test2: Promise.resolve(2)})}).test).test2).eq(2)
      await expect(async () => await (await a({test: Promise.resolve({test2: Promise.resolve("asd")})}).test).test2).rejects.toThrow()
    })

  })


  describe("Arbitrary instanceof check", () => {
    test("Promise usage", () => {
      const a = sani(Promise)
      expect.assertions(2)

      expect(a(Promise.resolve(2))).toBeInstanceOf(Promise)
      expect(() => a(2)).toThrow()
    })

    test("Array usage", () => {
      const a = sani(Array)
      expect.assertions(3)

      expect(a([])).toBeInstanceOf(Array)
      expect(() => a(2)).toThrow()
      expect(() => a({})).toThrow()
    })

    test("Object usage", () => {
      const a = sani(Object)
      expect.assertions(2)

      expect(a({})).toBeInstanceOf(Object)
      expect(() => a(2)).toThrow()
    })

    test("Custom class usage", () => {
      class Custom {}
      const a = sani(Custom)
      expect.assertions(2)

      expect(a(new Custom())).toBeInstanceOf(Custom)
      expect(() => a(2)).toThrow()
    })


  })


  describe("Mapped object", () => {
    test("Basic usage", () => {
      const against = sani(new OBJECT(Number))

      expect(against({lel: 2, qwe: 3, hasdh: 212321})).eq({lel: 2, qwe: 3, hasdh: 212321})
      expect(() => against({lel: 2, qwe: 3, hasdh: 212321, lelS: "qwe"})).toThrow()
      expect(() => against({lelS: "2"})).toThrow()
      expect(against({})).eq({})
    })

    test("Key usage", () => {
      const against = sani(new OBJECT(Boolean, new AND(String, ensure((s) => s.startsWith("lel"))) as any as (a: any) => `lel${string}`))

      expect(against({lel: false, lel2: false, lel3: true})).eq({lel: false, lel2: false, lel3: true})
      expect(() => against({lel: false, le2: false, lel3: true})).toThrow()
      expect(() => against({lel: false, lel2: "false", lel3: true})).toThrow()

    })

    test("startsWithStringUsage key usage", () => {
      const against = sani(new OBJECT(Boolean, stringStartsWith("lel")))

      expect(against({lel: false, lel2: false, lel3: true})).eq({lel: false, lel2: false, lel3: true})
      expect(() => against({lel: false, le2: false, lel3: true})).toThrow()
      expect(() => against({lel: false, lel2: "false", lel3: true})).toThrow()
    })

    test("Numberlike key usage", () => {
      const against = sani(new OBJECT(Boolean, numberLikeStringPattern))

      expect(against({1: false, 2: false, 3: true})).eq({1: false, 2: false, 3: true})
      expect(() => against({1: false, 2: "false", 3: true})).toThrow()
      expect(() => against({"a": false, 2: false, 3: true})).toThrow()
      expect(against({})).eq({})


      expect(against({"1": false, "2": false, "3": true})).eq({1: false, 2: false, 3: true})
      expect(() => against({"1": false, "2": "false", "3": true})).toThrow()
      expect(() => against({"a": false, "2": false, "3": true})).toThrow()

    })

    test("prototype poisoning protection", () => {
      const against = sani(new OBJECT(Boolean, stringStartsWith("lel")))

      const input1 = Object.create(null)
      input1.lel1 = false
      input1.__proto__ = {lel123: false}

      expect(against(input1)).eq({lel1: false})
      expect(against(input1).lel123).eq(undefined)
      expect("lel123" in against(input1)).eq(false)
    })

  })


  test("Ensure helper function", () => {
    const e = ensure((s: string) => s.startsWith("lel"))

    expect(e("lel")).eq("lel")
    expect(e("lel2")).eq("lel2")
    expect(() => e("qwe")).toThrow()
    expect(() => e(2)).toThrow()
    expect(() => e({})).toThrow()

    const e2 = ensure((s: string) => s.startsWith("lel2"), "Must start with lel2")

    expect(e2("lel2")).eq("lel2")
    expect(() => e2("lel")).toThrow()
  })

  test("stringStartsWith helper function", () => {
    const e = stringStartsWith("lel2")

    expect(e("lel2")).eq("lel2")
    expect(() => e("lel")).toThrow()
  })

})

