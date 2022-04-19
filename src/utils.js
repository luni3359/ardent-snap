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
