// It's faster to type
export function print(...args) {
    console.log(...args);
}

// Determines the true type of a variable
export const toType = (param) => {
    if (param === NaN) return 'NaN';
    else return Object.prototype.toString.call(param).replace('[object ', '').slice(0, -1).toLowerCase();
}

// Hard lock the browser
export function sleep(milliseconds) {
    const date = Date.now();
    let currentDate = null;
    do {
        currentDate = Date.now();
    } while (currentDate - date < milliseconds);
}

export function castStringType(val) {
    if (typeof val !== "string") {
        throw TypeError("'castStringType' received a non-string value.");
    }

    switch (val.toLowerCase()) {
        case "true":
            return true;
        case "false":
            return false;
        case "null":
            return null;
        default:
            throw Exception("'castStringType' received a plain string value.");
    }
}

// https://stackoverflow.com/a/16608074/7688278
// Checks whether the "a" is {}
export function isLiteralObject(a) {
    return (!!a) && (a.constructor === Object);
}
