// I use AEL for my calculator

// lexical analysis
let lex = function (input) {
    let tokens = [];

    let isOperator = function (c) {
        return /[+\-*\/^%=(),]/.test(c);
    };

    let isDigit = function (c) {
        return /[0-9]/.test(c);
    };

    let isWhiteSpace = function (c) {
        return /\s/.test(c);
    };

    let c, i = 0;

    let advance = function () {
        return c = input[++i];
    };

    let addToken = function (type, value) {
        tokens.push({
            type: type,
            value: value
        });
    };

    while (i < input.length) {
        // if c is whitespace -> skip
        if (isWhiteSpace(c)) {
            advance();
        }
        // if c is operator -> add operator to tokens
        else if (isOperator(c)) {
            addToken(c);
            advance();
        }
        // if c is digit -> add digit to tokes
        // calculator can work with float numbers (separator '.')
        else if (isDigit(c)) {
            let num = c;
            while (isDigit(advance())) {
                num += c;
            }
            if (c === '.') {
                do {
                    num += c;
                } while (isDigit(advance()));
            }

            num = parseFloat(num);

            if (!isFinite(num)) {
                throw "Err 64-bit double";
            }

            addToken("number", num);
        }
        else {
            throw "Unrecognized token";
        }
    }

    addToken("(end)");
    return tokens;
};

let parser = function (tokens) {
    let parseTree = [];



    return parseTree;
};