import cloneKeys from "circ-clone"
import sani, { AND, OR, NOT, AWAITED, OBJECT, ensure, stringStartsWith, numberLikeStringPattern, regex, unknown, any, nonEmptyStringPattern, numericRange, numberLikePattern } from "../../app/src/sanitizeAgainst"
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
    expect(sani({})(undefined)).eq({})
    expect(sani({test: "test", q: 2})(undefined)).eq({test: "test", q: 2})
    expect(sani({test: "test", q: 2})({test: undefined, q: null})).eq({test: "test", q: 2})
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

  test("spesific object requires plain object", () => {
    expect(sani({test: "test"})({})).eq({test: "test"})
    expect(sani({test: "test"})(Object.create(null))).eq({test: "test"})
    expect(Object.getPrototypeOf(sani({test: "test"})(Object.create(null)))).eq(Object.prototype)
    expect(sani({test: "test"})((() => {let o = Object.create(null); o.test1 = 0; o.test = "lel"; return o})())).eq({test: "lel"})
    expect(() => sani({test: "test"})((() => {let o = Object.create(null); o.test = 0; return o})())).toThrow()
    expect(() => sani({test: "test"})(new class A{})).toThrow()
    expect(() => sani({test: "test"})(new class A{public test = "lel"})).toThrow()
    expect(() => sani({test: "test"})([])).toThrow()
  })

  test("Unspesific object requirement default", () => {
    expect(() => sani(Object)(undefined)).toThrow()
    expect(() => sani(Object)(null)).toThrow()
  })

  test("Unspesific object requirement with spesific value", () => {
    expect(sani(Object)({test: "test"})).eq({test: "test"})
    expect(sani(Object)({test: "test", q: 2})).eq({test: "test", q: 2})

    expect(() => sani(Object)("test")).toThrow()
    expect(() => sani(Object)(2)).toThrow()
  })

  test("Unspesific object null prototype passes", () => {
    expect(sani(Object)({})).eq({})
    expect(sani(Object)(Object.create(null))).eq(Object.create(null))
    expect(Object.getPrototypeOf(sani(Object)(Object.create(null)))).toEqual(null)
    expect(Object.getPrototypeOf(sani(Object)({}))).toEqual(Object.prototype)
    expect(sani(Object)((() => {let o = Object.create(null); o.test1 = 0; o.test = "lel"; return o})())).eq({test: "lel", test1: 0})
    expect(sani(Object)((() => {let o = Object.create(null); o.test = 1; return o})())).eq({test: 1})
  })


  test("Unspesific object can be superclass", () => {
    class A{}
    expect(sani(Object)(new A)).eq({})
    expect(sani(Object)(new class B{public test = "lel"})).eq({test: "lel"})
    expect(sani(Object)(new A)).toBeInstanceOf(A)
    expect(sani(Object)(new A)).toBeInstanceOf(Object)
    expect(sani(Object)([])).eq([])
    expect(sani(Object)(["qwe"])).eq(["qwe"])
    expect(sani(Object)(["qwe"])).eq(["qwe"])
    expect(sani(Object)(["qwe"])).toBeInstanceOf(Array)
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


  describe("Instanceof check", () => {
    describe("Arbitrary", () => {
      test("Promise usage", () => {
        const a = sani(Promise)
        expect.assertions(2)
  
        expect(a(Promise.resolve(2))).toBeInstanceOf(Promise)
        expect(() => a(2)).toThrow()
      })
  
      test("Array usage", () => {
        const a = sani(Array)
  
        expect(a([])).toBeInstanceOf(Array)
        expect(a([1,2,"3"])).eq([1,2,"3"])
        expect(() => a(2)).toThrow()
        expect(() => a({})).toThrow()
      })
  
      test("Object usage", () => {
        const a = sani(Object)
  
        expect(a({})).toBeInstanceOf(Object)
        expect(a({lel: 2, qwe: "qwe"})).eq({lel: 2, qwe: "qwe"})
        expect(a(Number)).toBeInstanceOf(Object)
        expect(a(Number)).toBe(Number)
        expect(a(Array)).toBeInstanceOf(Object)
        expect(a(Array)).toBe(Array)
        expect(a(Promise)).toBeInstanceOf(Object)
        expect(a(Promise)).toBe(Promise)
        const numNormal = Number(2)
        expect(() => a(numNormal)).toThrow()
        expect(() => a(numNormal)).toThrow()
        expect(() => a(numNormal)).toThrow()


        const numOb = new Number(2)
        expect(a(numOb)).toBeInstanceOf(Object)
        expect(a(numOb)).toBeInstanceOf(Number)
        expect(a(numOb)).toBe(numOb)
  
        const ar = [1,2,"3",false]
        expect(a(ar)).toBeInstanceOf(Object)
        expect(a(ar)).toBeInstanceOf(Array)
        expect(a(ar)).toBe(ar)
  
        const prom = Promise.resolve(2)
        expect(a(prom)).toBeInstanceOf(Object)
        expect(a(prom)).toBeInstanceOf(Promise)
        expect(a(prom)).toBe(prom)
        
        expect(() => a(2)).toThrow()
        expect(() => a(false)).toThrow()
        expect(() => a("2")).toThrow()
        expect(() => a(Symbol("2"))).toThrow()
        expect(() => a(null)).toThrow()
        expect(() => a(undefined)).toThrow()
      })
  
      test("Custom class usage", () => {
        class Custom {}
        const a = sani(Custom)
  
        expect(a(new Custom())).toBeInstanceOf(Custom)
        expect(() => a(new Promise(() => {}))).toThrow()
        expect(() => a(2)).toThrow()
      })
    })
  })


  describe("Mapped object", () => {
    test("Plain object", () => {
      const a = sani(new OBJECT())

      expect(a({})).eq({})
      expect(a({lel: 2, qwe: "qwe"})).eq({lel: 2, qwe: "qwe"})
      expect(() => a(new Promise(() => {}))).toThrow()
      expect(() => a(2)).toThrow()
      expect(() => a(null)).toThrow()
      expect(() => a(undefined)).toThrow()
      expect(() => a(Number(2))).toThrow()
      expect(() => a(new class A{})).toThrow()
      expect(() => a([1,2,3])).toThrow()

    })

    test("Value usage", () => {
      const against = sani(new OBJECT(Number))

      expect(against({lel: 2, qwe: 3, hasdh: 212321})).eq({lel: 2, qwe: 3, hasdh: 212321})
      expect(() => against({lel: 2, qwe: 3, hasdh: 212321, lelS: "qwe"})).toThrow()
      expect(() => against({lelS: "2"})).toThrow()
      expect(() => against({lelS: {lel : 2}})).toThrow()
      expect(against({})).eq({})
    })

    test("Combinatorics value usage", () => {
      const a1 = sani(new OBJECT(new OR(Number, Boolean)))

      expect(a1({lel: 2, qwe: 3, hasdh: 212321})).eq({lel: 2, qwe: 3, hasdh: 212321})
      expect(() => a1({lel: 2, qwe: 3, hasdh: 212321, lelS: "qwe"})).toThrow()
      expect(() => a1({lelS: "2"})).toThrow()
      expect(() => a1({lelS: {lel : 2}})).toThrow()
      expect(a1({})).eq({})
      expect(a1({lel: 2, qwe: 3, qq: false})).eq({lel: 2, qwe: 3, qq: false})
      expect(a1({lel: 2, qwe: 3, qq: true, qqq: 2})).eq({lel: 2, qwe: 3, qq: true, qqq: 2})
      expect(() => a1({lel: 2, qwe: 3, qq: false, qqq: "2"})).toThrow()

      const a2 = sani(new OBJECT(new AND(Number, (inp) => {
        if (inp < 3) throw new Error("asd")
        else return inp
      })))

      expect(() => a2({lel: 2, qwe: 3, hasdh: 212321})).toThrow()
      expect(a2({lel: 3, qwe: 4, hasdh: 212321})).eq({lel: 3, qwe: 4, hasdh: 212321})
      expect(() => a2({lel: 2, qwe: 3, hasdh: 212321, lelS: "qwe"})).toThrow()
      expect(() => a2({lelS: "2"})).toThrow()
      expect(() => a2({lelS: {lel : 2}})).toThrow()
      expect(a2({})).eq({})

      const a3 = sani(new OBJECT(new AND(Number, new NOT((inp: number) => {
        if (inp < 3) throw new Error("asd")
        else return inp
      }))))

      expect(a3({}))

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


    describe("prototype poisoning protection", () => {
      test("flat", () => {
        const against = sani(new OBJECT(Boolean, stringStartsWith("lel")))

        const input1 = Object.create(null)
        input1.lel1 = false
        input1.__proto__ = {lel123: false}
  
        expect(against(input1)).eq({lel1: false})
        expect(against(input1).lel123).eq(undefined)
        expect("lel123" in against(input1)).eq(false)
        expect(Object.keys(against(input1)).length).eq(1)
        expect(against(({}))).eq({})
        expect(({} as any).lel123).eq(undefined)


        const input2 = Object.create(null)
        input2.lel1 = false
        input2.lel2 = "false"
        input2.__proto__ = {lel123: false}
  
        expect(() => against(input2)).toThrow()
        expect(against(({}))).eq({})
        expect(({} as any).lel123).eq(undefined)




        const input3 = Object.create(null)
        input3.lel1 = false
        input3.__proto__ = {le123: false, qwe: "asd"}
  
        expect(against(input3)).eq({lel1: false})
        expect(against(input3).le123).eq(undefined)
        expect(against(input3).qwe).eq(undefined)
        expect("le123" in against(input3)).eq(false)
        expect(Object.keys(against(input3)).length).eq(1)
        expect(against(({}))).eq({})
        expect(({} as any).le123).eq(undefined)
        expect(({} as any).qwe).eq(undefined)
      })

      test("soft", () => {
        const against = sani(new OBJECT(Boolean, true))
  
        const input1 = Object.create(null)
        input1.lel1 = false
        input1.lel2 = "false"
        input1.__proto__ = {lel123: false}
  
        expect(against(input1)).eq({lel1: false})
        expect(against(input1).lel123).eq(undefined)
        expect("lel123" in against(input1)).eq(false)
        expect(Object.keys(against(input1)).length).eq(1)

        expect(against(({}))).eq({})
        expect(({} as any).lel123).eq(undefined)
      })


      test("deep", () => {
        const against = sani(new OBJECT(Boolean, false, true))
  
        const payload = Object.create(null)
        payload.lel1 = false
        payload.__proto__ = {lel123: false}
  
        const input1 = {
          qwe: {
            whoop: true,
            payload
          },
          lel1: false
        }

        input1.qwe.payload.wham = input1.qwe
        input1.qwe.payload.wham2 = input1
        // @ts-ignore
        input1.qwe2 = input1
        // @ts-ignore
        input1.qwe2.qwe.ref = input1
        
        const out1 = cloneKeys(input1)
  
  
        expect(against(input1)).eq(out1)
        expect(against(input1).lel123).eq(undefined)
        expect("lel123" in against(input1)).eq(false)
        expect(Object.keys(against(input1).qwe.payload).length).eq(3)

        expect(against(({}))).eq({})
        expect(({} as any).lel123).eq(undefined)


  
        const payload2 = Object.create(null)
        payload2.__proto__ = {lel123: true, what: "qwqwe"}
  
        const input2 = {
          qwe: {
            whoop: true,
            payload2
          },
          lel1: false
        }

        input2.qwe.payload2.wham = input2.qwe
        input2.qwe.payload2.wham2 = input2
        // @ts-ignore
        input2.qwe2 = input2
        // @ts-ignore
        input2.qwe2.qwe.ref = input2
        
        const out2 = cloneKeys(input2)
  
  
        expect(against(input2)).eq(out2)
        expect(Object.keys(against(input2).qwe.payload2).length).eq(2 )

        expect(against(({}))).eq({})
        expect(({} as any).lel123).eq(undefined)



        const payload3 = Object.create(null)
        payload3.lel = "wqe"
        payload3.__proto__ = {lel123: false}
  
        const input3 = {
          qwe: {
            whoop: true,
            payload3
          },
          lel1: false
        }

        input3.qwe.payload3.wham = input3.qwe
        input3.qwe.payload3.wham2 = input3
        // @ts-ignore
        input3.qwe2 = input3
        // @ts-ignore
        input3.qwe2.qwe.ref = input3
        
  
  
        expect(() => against(input3)).toThrow()

        expect(against(({}))).eq({})
        expect(({} as any).lel123).eq(undefined)
      })

      test("deep and soft", () => {
        const against = sani(new OBJECT(Boolean, true, true))
  

        const payload3 = Object.create(null)
        payload3.lel = "wqe"
        payload3.__proto__ = {lel123: false}
  
        const input3 = {
          qwe: {
            whoop: true,
            payload3
          },
          lel1: false
        }

        input3.qwe.payload3.wham = input3.qwe
        input3.qwe.payload3.wham2 = input3
        // @ts-ignore
        input3.qwe2 = input3
        // @ts-ignore
        input3.qwe2.qwe.ref = input3
        
  
        const output3 = cloneKeys(input3)
        delete output3.qwe.payload3.lel
  
        expect(against(input3)).eq(output3)
        expect(Object.keys(against(input3).qwe.payload3).length).eq(2)

        expect(against(({}))).eq({})
        expect(({} as any).lel123).eq(undefined)

        
      })
    })

    

    

    test("Deep", () => {

      function run(a: Function) {
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
  
        expect(() => a({
          lel1: false,
          lel2: {
            lel1: true,
            lel: "no"
          }
        })).toThrow()
  
        expect(() => a({
          lel1: false,
          lel2: {
            lel1: true,
            lel: {
              lel: "no"
            }
          }
        })).toThrow()
      }


      const a = sani(new OBJECT(Boolean, stringStartsWith("lel"), false, true))
      run(a)
      run(sani(new OBJECT(Boolean, false, true)))


      expect(() => a({
        lel1: false,
        lel2: {
          lel1: true,
          lel: {
            le: false
          }
        }
      })).toThrow()
    })

    test("Deep cyclic", () => {
      function run(a: Function) {
        const input1 = {
          lel1: false,
          lel2: {
            lel: true
          }
        }
        // @ts-ignore
        input1.lel2.lelinput1 = input1
  
        const output1 = cloneKeys(input1)
  
        expect(a(input1)).eq(output1)
  
        const input2 = {
          lel1: false,
          lel2: {
            lel: true,
            lel1: "no"
          }
        }
        // @ts-ignore
        input1.lel2.lelinput2 = input2
        
        expect(() => a(input2)).toThrow()
  
        const input3 = {
          lel1: false,
          lel2: {
            lel1: true,
            lel: {
              lel: "no"
            }
          }
        }
        // @ts-ignore
        input3.lel2.lelinput3 = input3
  
        expect(() => a(input3)).toThrow()
  
  
        const input4 = {
          lel1: false,
          lel2: {
            lel1: "true",
            lel: {
              lel: false
            }
          }
        }
        // @ts-ignore
        input3.lel2.lel.lelinput4 = input4
  
        expect(() => a(input4)).toThrow()

        const input5 = {
          lel1: false,
          lel2: {
            lel1: true,
            lel: {
              lel: false
            }
          }
        }

        // @ts-ignore
        input5.lel2.lelel = input5.lel2.lel
        // @ts-ignore
        input5.lelel = input5.lel2.lel
        // @ts-ignore
        input5.lel2.lelel2 = input5


        expect(a(cloneKeys(input5))).eq(input5)



        const input6 = {
          lel1: false,
          lel2: {
            lel1: "true",
            lel: {
              lel: false
            }
          }
        }

        // @ts-ignore
        input6.lel2.lelel = input6.lel2.lel
        // @ts-ignore
        input6.lelel = input6.lel2.lel
        // @ts-ignore
        input6.lel2.lelel2 = input6

        expect(() => a(input6)).toThrow()


        const input7 = {
          lel1: false,
          lel2: {
            lel1: true,
            lel: {
              lel: "false"
            }
          }
        }

        // @ts-ignore
        input7.lel2.lelel = input7.lel2.lel
        // @ts-ignore
        input7.lelel = input7.lel2.lel
        // @ts-ignore
        input7.lel2.lelel2 = input7

        expect(() => a(input7)).toThrow()

      }

      run(sani(new OBJECT(Boolean, stringStartsWith("lel"), false, true)))
      run(sani(new OBJECT(Boolean, false, true)))


      const a = sani(new OBJECT(Boolean, stringStartsWith("lel"), false, true))

      const input1 = {
        lel1: false,
        lel2: {
          lel1: true,
          lel: {
            le: true
          }
        }
      }

      expect(() => a(input1)).toThrow()


      const input2 = {
        lel1: false,
        lel2: {
          le: true,
          lel: {
            lel: true
          }
        }
      }

      expect(() => a(input2)).toThrow()


      const input3 = {
        lel1: false,
        lel2: {
          lel1: true,
          lel: {
            le: true
          }
        }
      }

      // @ts-ignore
      input3.lel2.lelel = input3.lel2.lel
      // @ts-ignore
      input3.lelel = input3.lel2.lel
      // @ts-ignore
      input3.lel2.lelel2 = input3

      expect(() => a(input3)).toThrow()


      const input4 = {
        lel1: false,
        lel2: {
          le: true,
          lel: {
            lel: true
          }
        }
      }

      // @ts-ignore
      input4.lel2.lelel = input4.lel2.lel
      // @ts-ignore
      input4.lelel = input4.lel2.lel
      // @ts-ignore
      input4.lel2.lelel2 = input4

      expect(() => a(input4)).toThrow()
    })

    test("Soft", () => {
      
      function run(a: Function) {
        expect(a({
          lel1: false,
          lel2: "no",
          lel3: {
            lel: true,
            lel2: 2
          }
        })).eq({
          lel1: false
        })
      }

      const a = sani(new OBJECT(Boolean, stringStartsWith("lel"), true))
      run(a)
      run(sani(new OBJECT(Boolean, true)))
      run(sani(new OBJECT(Boolean, stringStartsWith("lel"), true, false)))
      run(sani(new OBJECT(Boolean, true, false)))
      
      

      expect(a({
        lel1: false,
        lel2: "no",
        lel3: 2,
        lel4: true,
        le5: true,
      })).eq({
        lel1: false,
        lel4: true
      })

        
    })

    test("Deep and soft", () => {
      function run(a: Function) {
        expect(a({
          lel1: false,
          lel2: "no",
          lel3: {
            lel: true,
            lel2: 2
          }
        })).eq({
          lel1: false,
          lel3: {
            lel: true
          }
        })
      }

      const a = sani(new OBJECT(Boolean, stringStartsWith("lel"), true, true))
      run(a)
      run(sani(new OBJECT(Boolean, true, true)))
      
      

      expect(a({
        lel1: false,
        lel2: "no",
        lel3: 2,
        lel4: true,
        le5: true,
      })).eq({
        lel1: false,
        lel4: true
      })

      expect(a({
        lel1: false,
        lel2: "no",
        lel3: 2,
        lel4: true,
        le1: true,
        le2: {
          lel: true,
        },
        lel5: {
          lel2: false,
          lel3: false,
          qwe: {
            lel: true
          }
          lel4: 2,
          lel5: {
            lel: true,
            lel2: 2
          }
          lel6: {},
          lel7: {
            le: true,
            lel: 2,
            le: 4
          }
        }
      })).eq({
        lel1: false,
        lel4: true,
        lel5: {
          lel2: false,
          lel3: false,
          lel5: {
            lel: true
          },
          lel6: {},
          lel7: {}
        }
      })
    })

    test("Deep and soft cyclic", () => {
      function run(a: Function) {
        const input1 = {
          lel1: false,
          lel2: {
            lel: true
          }
        }
        // @ts-ignore
        input1.lel2.lelinput1 = input1
  
        const output1 = cloneKeys(input1)
  
        expect(a(input1)).eq(output1)
  
        const input2 = {
          lel1: false,
          lel2: {
            lel: true,
            lel1: "no"
          }
        }
        // @ts-ignore
        input1.lel2.lelinput2 = input2

        const output2 = cloneKeys(input2)
        delete output2.lel2.lel1
  
        expect(a(input2)).eq(output2)
  
        const input3 = {
          lel1: false,
          lel2: {
            lel1: true,
            lel: {
              lel: "no"
            }
          }
        }
        // @ts-ignore
        input3.lel2.lelinput3 = input3

        const output3 = cloneKeys(input3)
        delete output3.lel2.lel.lel
  
        expect(a(input3)).eq(output3)
  
  
        const input4 = {
          lel1: false,
          lel2: {
            lel1: "no",
            lel: {
              lel: false
            }
          }
        }
        // @ts-ignore
        input4.lel2.lel.lelinput4 = input4

        const output4 = cloneKeys(input4)
        delete output4.lel2.lel1
  
        expect(a(input4)).eq(output4)



        const input5 = {
          lel1: false,
          lel2: {
            lel1: true,
            lel: {
              lel: false
            }
          }
        }

        // @ts-ignore
        input5.lel2.lelel = input5.lel2.lel
        // @ts-ignore
        input5.lelel = input5.lel2.lel
        // @ts-ignore
        input5.lel2.lelel2 = input5


        expect(a(cloneKeys(input5))).eq(input5)



        const input6 = {
          lel1: false,
          lel2: {
            lel1: "true",
            lel: {
              lel: false
            }
          }
        }

        // @ts-ignore
        input6.lel2.lelel = input6.lel2.lel
        // @ts-ignore
        input6.lelel = input6.lel2.lel
        // @ts-ignore
        input6.lel2.lelel2 = input6


        const output6 = cloneKeys(input6)
        delete output6.lel2.lel1

        expect(a(input6)).eq(output6)


        const input7 = {
          lel1: false,
          lel2: {
            lel1: true,
            lel: {
              lel: "false"
            }
          }
        }

        // @ts-ignore
        input7.lel2.lelel = input7.lel2.lel
        // @ts-ignore
        input7.lelel = input7.lel2.lel
        // @ts-ignore
        input7.lel2.lelel2 = input7

        const output7 = cloneKeys(input7)
        delete output7.lel2.lel.lel

        expect(a(input7)).eq(output7)
      }

      run(sani(new OBJECT(Boolean, stringStartsWith("lel"), true, true)))
      run(sani(new OBJECT(Boolean, true, true)))


      const a = sani(new OBJECT(Boolean, stringStartsWith("lel"), true, true))

      const input1 = {
        lel1: false,
        lel2: {
          lel1: true,
          lel: {
            le: true
          }
        }
      }

      const output1 = cloneKeys(input1)
      delete output1.lel2.lel.le

      expect(a(input1)).eq(output1)


      const input2 = {
        lel1: false,
        lel2: {
          le: true,
          lel: {
            lel: true
          }
        }
      }
      
      const output2 = cloneKeys(input2)
      delete output2.lel2.le

      expect(a(input2)).eq(output2)


      const input3 = {
        lel1: false,
        lel2: {
          lel1: true,
          lel: {
            le: true
          }
        }
      }

      // @ts-ignore
      input3.lel2.lelel = input3.lel2.lel
      // @ts-ignore
      input3.lelel = input3.lel2.lel
      // @ts-ignore
      input3.lel2.lelel2 = input3

      const output3 = cloneKeys(input3)
      delete output3.lel2.lel.le

      expect(a(input3)).eq(output3)


      const input4 = {
        lel1: false,
        lel2: {
          le: true,
          lel: {
            lel: true
          }
        }
      }

      // @ts-ignore
      input4.lel2.lelel = input4.lel2.lel
      // @ts-ignore
      input4.lelel = input4.lel2.lel
      // @ts-ignore
      input4.lel2.lelel2 = input4

      const output4 = cloneKeys(input4)
      delete output4.lel2.le

      expect(a(input4)).eq(output4)
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


  describe("utils", () => {
    test("unknown", () => {
      const r = sani(unknown)

      expect(r(2)).eq(2)
      expect(r("2")).eq("2")
      expect(r(false)).eq(false)
      expect(r({})).eq({})
      expect(r({qwe: 2})).eq({qwe: 2})
      expect(r([])).eq([])
      expect(() => r(null)).toThrow()
      expect(() => r(undefined)).toThrow()

      const r2 = sani({
        "a?": unknown,
        b: "lel"
      })

      expect(r2({a: 2, b: "qwe"})).eq({a: 2, b: "qwe"})
      expect(r2({a: "qwe"})).eq({a: "qwe", b: "lel"})
      expect(r2({})).eq({b: "lel"})
      expect(r2({b: "qwe"})).eq({b: "qwe"})
      expect(() => r2({a: undefined})).toThrow()
      expect(() => r2({a: null})).toThrow()
    })

    test("any", () => {
      const r = sani(any)

      expect(r(2)).eq(2)
      expect(r("2")).eq("2")
      expect(r(false)).eq(false)
      expect(r({})).eq({})
      expect(r({qwe: 2})).eq({qwe: 2})
      expect(r([])).eq([])
      expect(r(null)).eq(null)
      expect(r(undefined)).eq(undefined)

      const r2 = sani({
        "a?": any,
        b: "lel"
      })

      expect(r2({a: 2, b: "qwe"})).eq({a: 2, b: "qwe"})
      expect(r2({a: "qwe"})).eq({a: "qwe", b: "lel"})
      expect(r2({})).eq({b: "lel"})
      expect(r2({a: undefined})).eq({a: undefined, b: "lel"})
      expect(r2({a: null})).eq({a: null, b: "lel"})
    })

    test("nonEmptyStringPattern", () => {
      const r = sani(nonEmptyStringPattern)

      expect(r("2")).eq("2")
      expect(r("qwe")).eq("qwe")
      expect(r(" ")).eq(" ")
      expect(() => r("")).toThrow()
      expect(() => r(null)).toThrow()
      expect(() => r(2)).toThrow()
      expect(() => r(String)).toThrow()
      expect(() => r(String)).toThrow()
    })

    test("numericRange", () => {
      const r = sani(numericRange(2, 4))

      expect(r(2)).eq(2)
      expect(r(3)).eq(3)
      expect(r(4)).eq(4)
      expect(() => r(1)).toThrow()
      expect(() => r(-3)).toThrow()
      expect(() => r(5)).toThrow()
      expect(() => r("2")).toThrow()
      expect(() => r(null)).toThrow()
      expect(() => r(undefined)).toThrow()

      expect(() => sani(numericRange(4, 2))).toThrow()
    })

    test("stringStartsWith", () => {
      const r = sani(stringStartsWith("lel"))

      expect(r("lel")).eq("lel")
      expect(r("lel2")).eq("lel2")
      expect(() => r("qlelwe")).toThrow()
      expect(() => r("qlel")).toThrow()
      expect(() => r("qelel")).toThrow()
      expect(() => r("qwe")).toThrow()
      expect(() => r(2)).toThrow()
      expect(() => r({})).toThrow()
    })

    test("numberLikePattern", () => {
      const r = sani(numberLikePattern)

      expect(r("2")).eq(2)
      expect(r("+2")).eq(2)
      expect(r("-2")).eq(-2)
      expect(r("Infinity")).eq(Infinity)
      expect(r("-Infinity")).eq(-Infinity)
      expect(r("1e1")).eq(10)
      expect(r("100e0")).eq(100)
      expect(r("2.2")).eq(2.2)
      expect(r("2.2e2")).eq(2.2e2)
      expect(r("2.2e-2")).eq(2.2e-2)
      expect(r("2.2e+2")).eq(2.2e+2)

      expect(r(2)).eq(2)
      expect(r(Infinity)).eq(Infinity)

      expect(() => r("")).toThrow()
      expect(() => r("2.2e+2qwe")).toThrow()
      expect(() => r("p2")).toThrow()
      expect(() => r("2px")).toThrow()
      expect(() => r("2e")).toThrow()
      expect(() => r(NaN)).toThrow()
    })

    test("numberLikeStringPattern", () => {
      const r = sani(numberLikeStringPattern)

      expect(r("2")).eq("2")
      expect(r("+2")).eq("+2")
      expect(r("-2")).eq("-2")
      expect(r("Infinity")).eq("Infinity")
      expect(r("-Infinity")).eq("-Infinity")
      expect(r("1e1")).eq("1e1")
      expect(r("100e0")).eq("100e0")
      expect(r("2.2")).eq("2.2")
      expect(r("2.2e2")).eq("2.2e2")
      expect(r("2.2e-2")).eq("2.2e-2")
      expect(r("2.2e+2")).eq("2.2e+2")

      expect(r(2)).eq("2")
      expect(r(Infinity)).eq("Infinity")

      expect(() => r("")).toThrow()
      expect(() => r("2.2e+2qwe")).toThrow()
      expect(() => r("p2")).toThrow()
      expect(() => r("2px")).toThrow()
      expect(() => r("2e")).toThrow()
      expect(() => r(NaN)).toThrow()
    })

    describe("using two utils with same inheritance", () => {
      test("numberLikePattern with numberLikePatternString", () => {
        const rn = sani(numberLikePattern)
        const rs = sani(numberLikeStringPattern)

        expect(rn("2")).eq(2)
        expect(rn("+2")).eq(2)
        expect(rn("-2")).eq(-2)
        expect(rn("Infinity")).eq(Infinity)
        expect(rs("2")).eq("2")
        expect(rs("+2")).eq("+2")
        expect(rs("-2")).eq("-2")
        expect(rs("Infinity")).eq("Infinity")
        expect(rs("-Infinity")).eq("-Infinity")
        expect(rs("1e1")).eq("1e1")
        expect(rs("100e0")).eq("100e0")
        expect(rn("-Infinity")).eq(-Infinity)
        expect(rn("1e1")).eq(10)
        expect(rn("100e0")).eq(100)
        expect(rn("2.2")).eq(2.2)
        expect(rs("2.2")).eq("2.2")
        expect(rs("2.2e2")).eq("2.2e2")
        expect(rs("2.2e-2")).eq("2.2e-2")
        expect(rs("2.2e+2")).eq("2.2e+2")
        expect(rn("2.2e2")).eq(2.2e2)
        expect(rn("2.2e-2")).eq(2.2e-2)
        expect(rn("2.2e+2")).eq(2.2e+2)

        expect(rn(2)).eq(2)
        expect(() => rs("")).toThrow()
        expect(() => rs("2.2e+2qwe")).toThrow()
        expect(() => rs("p2")).toThrow()
        expect(() => rs("2px")).toThrow()
        expect(rn(Infinity)).eq(Infinity)

        expect(() => rn("")).toThrow()
        expect(() => rn("2.2e+2qwe")).toThrow()
        expect(() => rn("p2")).toThrow()
        expect(rs(2)).eq("2")
        expect(rs(Infinity)).eq("Infinity")
        expect(() => rn("2px")).toThrow()
        expect(() => rn("2e")).toThrow()
        expect(() => rs("2e")).toThrow()
        expect(() => rs(NaN)).toThrow()
        expect(() => rn(NaN)).toThrow()

        
        

        
        

        

        
        
      })
    })


    describe("regex", () => {
      test("basic regex", () => {
        const r = sani(regex(/lel/i))
  
        expect(() => r(2)).toThrow()
        expect(() => r(null)).toThrow()
        expect(() => r({qwe: 2})).toThrow()
        expect(r("qwelelqwe")).eq("qwelelqwe")
        expect(() => r("qweleqwe")).toThrow()
        expect(() => r("leqwleel")).toThrow()
        expect(r("abcabclel")).eq("abcabclel")
        expect(r("lelabc")).eq("lelabc")

        expect(r("LeLabc")).eq("LeLabc")
        expect(r("LELabc")).eq("LELabc")
        expect(r("leLabc")).eq("leLabc")
      })

      test("global flag still stateless", () => {
        const r = sani(regex(/lel/g))
  
        expect(r("qwelelqwe")).eq("qwelelqwe")
        expect(() => r("qweleqwe")).toThrow()
        expect(() => r("leqwleel")).toThrow()
        expect(r("abcabclel")).eq("abcabclel")
        expect(r("lelabc")).eq("lelabc")
      })

      test("sticky flag still stateless", () => {
        const r = sani(regex(/lel/y))
  
        expect(r("lelqwe")).eq("lelqwe")
        expect(() => r("qweleqwe")).toThrow()
        expect(() => r("leqwleel")).toThrow()
        expect(() => r("abcabclel")).toThrow()
        expect(r("lelabc")).eq("lelabc")
      })
    })
    

   
  })

})

