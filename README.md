# Sanitize Against

Sanitize Against is a library for sanitizing objects, intended to filter the options of incoming requests on the server. It is highly customizable, but simple to use and tries to be decently fast while being safe.

## Why?

* If you want to filter out unwanted properties from objects. Thus preventing [`__proto__` poisoning](https://medium.com/intrinsic-blog/javascript-prototype-poisoning-vulnerabilities-in-the-wild-7bc15347c96). 

* If you want a simple way to implement default properties or set the others as required to enforce a certain structure.

* If you want to sanitize your object's properties, to be of a certain type (e.g. number) and/or have a certain value range (e.g. 0-100).


## Installation

```shell
 $ npm i sanitize-against
```

### ESM

```ts
import sanitize, { OR, AND, NOT, each, someEnsure } from "sanitize-against"
```

### CJS

```ts
const { sanitize, OR, AND, NOT, each, someEnsure } = require("sanitize-against")
```

# Usage

Simple example of how to integrate it into a web server. We will look at the specific patterns and outputs later.

```ts
const userPattern = {
  name: String,
  "age?": Number,
  pin: OR(Number, String),
  settings: {
    darkMode: false,
    fontSize: 16
  }
}

const against = sanitize(userPattern)

// example route
app.post("/user", (req, res) => {
  try {
    const user = against(JSON.parse(req.body))
    // Do something with user
  }
  catche(e) {
    // The error.msg is not terribly useful.
    res.status(400).send("error")
  }
})
```

## Patterns

The main constructor function `sanitize` takes a pattern as input. A pattern is not necessarily an object. The simplest pattern conceptually, and at the same time the most powerful one, would be a function. 

### Function

This function will be called (with the input as first argument) when a new input is supposed to be sanitized. The function should throw when the input is not valid and otherwise return the okay (sanitized) value.

```ts
const pattern = (input: any) => {
  if (input === 2) throw new Error("Input is 2")
  else return input
}

const against = sanitize(pattern)

against(1) // 1
against(2) // throws
against("litterally anything else") // "litterally anything else"
```

> **Important error-semantics contract:** Every value thrown by a pattern is treated as a validation failure. Consequently, `OR`, `NOT`, `matches()` and soft `OBJECT` cannot distinguish an intentional rejection from a programming error or resource failure inside a pattern. Do not use those combinators as a fail-closed security boundary around patterns that perform fallible application or infrastructure work. Distinguishing validation failures from unexpected errors is deferred to a future major version because it would change which existing function-pattern errors propagate.

While this is hardly an abstraction at all, it is the basis for all other patterns. The function can be used to implement any kind of validation. For example, you could use it to check if the input is a number and if it is in a certain range. To simplify the process of creating such constraints, there are predefined patterns, or rather values which are mapped to predefined functions. We will describe them in the next couple sections. But it is important to keep in mind the option to fall back to a function when the predefined patterns are not specific enough. In a later chapter we will introduce boolesch logic, which can be used to combine (predefined) patterns with custom ones.

> Note: I use pattern, constraint and custom functions interchangeably.



### Primitives

You may use the values `Number`, `Boolean` and `String` (the primitive value constructors in the global scope) to specify that the input should be of that type. If the input is not of that type, or not set at all, it will throw. There is intentionally no attempt made at converting e.g. a string to a number. This is to prevent unexpected behavior and tbh I don't see a use case for it, as the frontend should be capable of converting it, and correctly sending it as a number. If you want to allow strings and numbers, you can use the `OR` combinator [see below](#or-combinator). If you disagree, please open an issue and explain your use case, and in the meantime simply fall back to a [custom function](#function). 

```ts
const pattern = Number
const against = sanitize(pattern)

against(1) // 1
against(123) // 123
against("1") // throws
against(undefined) // throws
against(false) // throws
```

#### Primitives as part of objects

We can also use the primitive values as part of an object structure pattern. This will enforce the type of the property and that there is a property. If you want a property to be optional, please see [optional properties](#optional-properties) or make it implicitly optional by defining specific values (of type boolean, number or string).

```ts
const pattern = {
  name: String,
  age: Number,
  isCool: Boolean
}

const against = sanitize(pattern)

// gotten from a client
const request = {
  name: "John",
  age: 20,
  isCool: true
}

let user = against(request)

user = {
  name: "John",
  age: 20,
  isCool: true
}

against({
  name: "John",
  age: "20",
  isCool: "true"
}) // throws

against({
  name: "John",
  age: 20
}) // throws
```

### Primitive defaults

You can specify a default value for a primitive by using specific values as the pattern. This works for numbers, strings and booleans. The default value will be used if the input is `undefined` or `null`. If the input is not `undefined` or `null`, it will be checked against the pattern. If the input is not of the correct type, it will throw.

```ts
const against = sanitize("default value")

against("anything") // "anything"
against(undefined) // "default value"
```

This works as part of objects analog to the [primitives](#primitives-as-part-of-objects) section.

### Objects

You can use objects as patterns to specify the structure of the input. The input must be an object and must have the same properties as the pattern. If the input is not an object, or if it is missing properties, or if some of the values of the object do not match the nested pattern, it will throw. If the input has more properties than the pattern, they will be ignored.

```ts
const pattern = {
  name: String,
  age: Number,
  isCool: true
}

const against = sanitize(pattern)

let user = against({
  name: "John",
  age: 20,
  anotherProp: "which will be ignored"
})

user = {
  name: "John",
  age: 20,
  isCool: true
}
```

Of course, you can nest objects.

```ts
const against = sanitize({
  name: String,
  age: Number,
  isCool: true,
  settings: {
    darkMode: false,
    fontSize: Number
  }
})
```

#### Optional properties

You can add a `?` at the end of a property name to make it explicitly optional. If the property is not set, it will be ignored. If the property is set, it will be checked against the nested pattern (so you can easily make e.g.: an optional Number property without a default, if it is not set). This `?` at the end of a pattern property name does not need to be present in the input object to be sanitized (imagine it like the typescript optional flag, just at runtime). 

```ts
const against = sanitize({
  "name?": String,
  "age?": (input) => {
    if (typeof input !== "number") throw new Error("Not a number")
    if (input < 0 || input > 150) throw new Error("Not in range")
    return Math.round(input)
  },
  isCool: true
})

against({
  name: "John"
}) // { name: "John", isCool: true }

against({
  name: "John",
  age: 20
}) // { name: "John", age: 20, isCool: true }

against({
  name: "John",
  age: -1
}) // throws

against({
  name: "John",
  age: 20.1
}) // { name: "John", age: 20, isCool: true }

against({}) // { isCool: true }
```

Just as patterns with default are optional by default, object patterns solely with static properties are optional by default. This means that you could just pass nothing into the `against` function above and get an empty object back (filled with default values ofc if available).

```ts
against() // { isCool: true }
```

### Combinators

Combinators are class instances which take patterns as arguments and act as a new, combined, pattern. 

#### OR

A simple combinator is the `OR` combinator. It takes n patterns and passes if any of them passes. It tries to sanitize the input with each pattern in order. If one of them succeeds, it returns the sanitized value of that pattern. If none of them succeed, it throws. 

```ts
const pattern = OR(
  Number,
  String
)

const against = sanitize(pattern)

against(1) // 1
against("1") // "1"
against(true) // throws
against({}) // throws
against() // throws
```

#### AND

The `AND` combinator takes `n` patterns and passes if all of them pass. It tries to sanitize the input with each pattern in order. If one of them fails, it throws. If all of them succeed, it returns the sanitized value of the last pattern.

```ts
const pattern = AND(
  Number,
  (input) => {
    if (input < 0) throw new Error("Not positive")
    return input
  }
)

const against = sanitize(pattern)

against(1) // 1
against(0) // 0
against(-1) // throws
against("1") // throws
```

#### NOT

The `NOT` combinator takes one pattern and passes if the input does not match the pattern. It tries to sanitize the input with the pattern. If it succeeds, it throws. If it fails, it returns the input.

```ts
const pattern = NOT(
  Number
)

const against = sanitize(pattern)

against(1) // throws
against("1") // "1"
against(true) // true
```

#### Combinations

Of course, you can combine the combinators, with each other, and with objects.

```ts
const isPositive = (input) => {
  if (input < 0) throw new Error("Not positive")
  return input
}

const pattern = {
  name: String,
  dob: OR(
    String,
    AND(
      Number,
      (input) => {
        if (input < 0) throw new Error("Not positive")
        return input
      }
    )
  )
}

const against = sanitize(pattern)

against({
  name: "John",
  dob: "1990-01-01"
}) // { name: "John", dob: "1990-01-01" }

against({
  name: "John",
  dob: 123
}) // { name: "John", dob: 123 }

against({
  name: "John",
  dob: -1
}) // throws

against({
  name: "John"
}) // throws
```

### Arrays

#### each

`each` takes a pattern and applies it to every entry of an array. The input must be an actual array (array-likes are rejected), otherwise it throws. It returns a **new** array containing the sanitized entries, leaving the input untouched.

```ts
const pattern = each(String)

const against = sanitize(pattern)

against(["a", "b"]) // ["a", "b"]
against([]) // []
against(["a", 2]) // throws
against("a") // throws (not an array)
against(undefined) // throws
```

Any pattern works as the entry pattern, including [defaults](#primitive-defaults), [objects](#objects), [combinators](#combinators) and `each` itself.

```ts
const against = sanitize(each({
  name: String,
  "age?": Number,
  isCool: false
}))

against([
  { name: "John", somethingElse: "which will be ignored" },
  { name: "Jane", age: 20, isCool: true }
])
// [{ name: "John", isCool: false }, { name: "Jane", age: 20, isCool: true }]
```

```ts
sanitize(each(each(Number)))([[1, 2], [3]]) // [[1, 2], [3]]
sanitize(each(0))([undefined, 5]) // [0, 5]
sanitize(each(OR(String, Number)))(["a", 1]) // ["a", 1]
```

Of course it can be used as part of an object pattern, and the property can be made [optional](#optional-properties) as usual.

```ts
const against = sanitize({
  tags: each(String),
  "ids?": each(Number)
})

against({ tags: ["a"], ids: [1, 2] }) // { tags: ["a"], ids: [1, 2] }
against({ tags: [] }) // { tags: [] }
against({}) // throws
```

The error message of a failing entry is prefixed with its index. Optionally you can pass a second argument to add your own message; either a string or a function receiving the whole input array and the index of the offending entry.

```ts
sanitize(each(String))(["a", 2])
// throws: At index 1: ... Input is not a string

sanitize(each(String, "Tags must be strings"))(["a", 2])
// throws: At index 1: Tags must be strings ... Input is not a string

sanitize(each(String, (input, index) => `Entry ${index} of ${input.length} is bad`))(["a", 2])
// throws: At index 1: Entry 1 of 2 is bad ... Input is not a string
```

#### someEnsure

`someEnsure` takes a validation function returning a boolean (rather than a [pattern](#patterns), which would signal failure by throwing) and passes if **at least one** entry of the array satisfies it. As with `each`, the input must be an actual array.

> Important: `someEnsure` does **not** replace anything. The return values of the validation function are only used as a boolean, and the input array is passed through as is. Use it to assert something about an array, and [`AND`](#and) it together with `each` if you also want the entries sanitized.

```ts
const pattern = someEnsure((tag) => tag === "admin")

const against = sanitize(pattern)

against(["user", "admin"]) // ["user", "admin"] (the very same array)
against(["user"]) // throws
against([]) // throws (an empty array has no passing element)
against("admin") // throws (not an array)
```

The second argument appends your own message to the thrown error; either a string or a function receiving the input array.

```ts
sanitize(someEnsure((tag) => tag === "admin", "At least one admin is required"))(["user"])
// throws: Input array must have at least one element that passes the validation. At least one admin is required
```

Note that the validation function is expected to return a boolean. If it throws instead, that error propagates immediately, even if a later entry would have passed.

Combine it with `each` to both sanitize the entries and assert a property of the array as a whole.

```ts
const against = sanitize(AND(
  each(Number),
  someEnsure((n) => n > 5)
))

against([1, 6]) // [1, 6]
against([1, 2]) // throws (none is greater than 5)
against(["1", 6]) // throws (not all are numbers)
```


## Polyfills

This module requires [`Object.hasOwn`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/hasOwn#browser_compatibility) (>= Node 16.9.0, >= Chrome 93). If you need to support older environments, you can lazy load all polyfills with the following code:

```ts
import { polyfill } from "sanitize-against"

await polyfill()
```


## Contribute

All feedback is appreciated. Create a pull request or write an issue.
