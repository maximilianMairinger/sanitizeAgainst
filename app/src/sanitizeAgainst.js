export async function polyfill() {
    if (!Object.hasOwn) {
        const { shim } = await import("object.hasown");
        shim();
    }
}
class Matcher {
}
export class CONST extends Matcher {
    constructor(constVal) {
        super();
        this.constVal = constVal;
    }
    matches(input) {
        if (input !== this.constVal)
            throw `Expected ${this.constVal}, got ${input}`;
        return input;
    }
}
class Combinator extends Matcher {
}
class BooleanCombinator extends Combinator {
    constructor(...inputs) {
        super();
        this.patterns = inputs;
        // this.ar = ar.map((a) => sanitizeRec(a))
    }
}
export class AND extends BooleanCombinator {
    constructor(...ar) {
        super(...ar);
    }
    matches(input) {
        let curRet = input;
        for (const a of this.sanis) {
            curRet = a(curRet);
        }
        return curRet;
    }
}
export class OR extends BooleanCombinator {
    constructor(...ar) {
        super(...ar);
    }
    matches(input) {
        for (const a of this.sanis) {
            try {
                return a(input);
            }
            catch (e) { }
        }
        throw new Error("No match");
    }
}
export class NOT extends Combinator {
    constructor(ar) {
        super();
        this.patterns = [ar];
        // this.ar = sanitize(ar)
    }
    matches(input) {
        let throws;
        try {
            this.sanis[0](input);
            throws = false;
        }
        catch (e) {
            throws = true;
        }
        if (throws)
            return input;
        else
            throw new Error("Match");
    }
}
function getNumberOfQuestionmarksAtTheEndOfString(str) {
    let i = str.length - 1;
    let count = 0;
    while (str[i] === "?") {
        count++;
        i--;
    }
    return count;
}
function againstPrimitiveDefault(type, defaultVal) {
    return (input) => {
        if (input === undefined || input === null)
            return defaultVal;
        else if (typeof input === type)
            return input;
        else
            throw new Error(`Input is not a ${type}`);
    };
}
function againstPrimitive(type) {
    return (input) => {
        if (typeof input === type)
            return input;
        else
            throw new Error(`Input is not a ${type}`);
    };
}
let knownPatternObjects;
let knownInputObjects;
function sanitize(pattern) {
    knownPatternObjects = new WeakMap();
    const out = sanitizeRec(pattern);
    knownPatternObjects = null;
    return (input) => {
        knownInputObjects = new WeakMap();
        const out2 = out(input);
        knownInputObjects = null;
        return out2;
    };
}
function sanitizeRec(pattern) {
    let against;
    const type = typeof pattern;
    if (type === "string")
        against = againstPrimitiveDefault("string", pattern);
    else if (type === "number")
        against = againstPrimitiveDefault("number", pattern);
    else if (type === "boolean")
        against = againstPrimitiveDefault("boolean", pattern);
    else if (pattern === String)
        against = againstPrimitive("string");
    else if (pattern === Number)
        against = againstPrimitive("number");
    else if (pattern === Boolean)
        against = againstPrimitive("boolean");
    else if (pattern instanceof Matcher) {
        if (pattern instanceof Combinator)
            pattern.sanis = pattern.patterns.map((input) => sanitizeRec(input));
        against = pattern.matches.bind(pattern);
    }
    else if (pattern === Object)
        against = (input) => {
            if (typeof input !== "object" || input === null || input instanceof Array)
                throw new Error('Input is not an object');
            return input;
        };
    // It is important that this check is after all the constructor checks like if (input === Boolean)
    else if (pattern instanceof Function)
        against = pattern;
    else if (typeof pattern === "object" && pattern !== null) {
        if (knownPatternObjects.has(pattern))
            return knownPatternObjects.get(pattern);
        const requiredPattern = new Map();
        const optinalPattern = new Map();
        for (const key in pattern) {
            const numberOfQuestionmarks = getNumberOfQuestionmarksAtTheEndOfString(key);
            let questionMarksToRemove = -Math.floor(numberOfQuestionmarks / 2);
            const isEvan = numberOfQuestionmarks % 2 === 0;
            if (!isEvan)
                questionMarksToRemove--;
            const keyWithoutQuestionmarks = questionMarksToRemove !== 0 ? key.slice(0, questionMarksToRemove) : key;
            (isEvan ? requiredPattern : optinalPattern).set(keyWithoutQuestionmarks, sanitizeRec(pattern[key]));
        }
        against = (input) => {
            if (input === null || input === undefined)
                input = {};
            else if (typeof input !== "object" || input instanceof Array)
                throw new Error('Input is not an object');
            if (knownInputObjects.has(input))
                return knownInputObjects.get(input);
            const out = Object.create(null);
            knownInputObjects.set(input, out);
            for (const [key, nestedAgainst] of requiredPattern) {
                const val = input[key] === undefined || Object.hasOwn(input, key) ? input[key] : undefined;
                out[key] = nestedAgainst(val);
            }
            for (const [key, nestedAgainst] of optinalPattern) {
                if (Object.hasOwn(input, key))
                    out[key] = nestedAgainst(input[key]);
            }
            // do this e.g. for equaals functions. Some implementations (e.g. fast-equals) check constructor for equality
            Object.setPrototypeOf(out, Object.prototype);
            return out;
        };
        knownPatternObjects.set(pattern, against);
    }
    return against;
}
export default sanitize;
