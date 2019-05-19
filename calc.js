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
        c = input[i];
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


// Top down operator precedence
// https://crockford.com/javascript/tdop/tdop.html
let parse = function(tokens) {
    let parseTree = [];

    let symbols = {},
        symbol = function(id, lbp, nud, led) {
            if (!symbols[id]) {
                symbols[id] = {
                    lbp: lbp,
                    nud: nud,
                    led: led
                };
            }
            else {
                if (nud) symbols[id].nud = nud;
                if (led) symbols[id].led = led;
                if (lbp) symbols[id].lbp = lbp;
            }
        };

    let interpretToken = function(token) {
        let Func = function() {};
        Func.prototype = symbols[token.type];
        let sym = new Func;
        sym.type = token.type;
        sym.value = token.value;
        return sym;
    };

    let i = 0;
    let token = function() {
        return interpretToken(tokens[i]);
    };
    let advance = function() {
        i++;
        return token();
    };

    let expression = function(rbp) {
        let left, t = token();
        advance();
        if (!t.nud) throw "Unexpected token: " + t.type;
        left = t.nud(t);
        while (rbp < token().lbp) {
            t = token();
            advance();
            if (!t.led) throw "Unexpected token: " + t.type;
            left = t.led(left);
        }
        return left;
    };

    let infix = function(id, lbp, rbp, led) {
        rbp = rbp || lbp;
        symbol(id, lbp, null, led ||
            function(left) {
                return {
                    type: id,
                    left: left,
                    right: expression(rbp)
                };
            });
    };

    let prefix = function(id, rbp, nud) {
        symbol(id, null, nud ||
            function() {
                return {
                    type: id,
                    right: expression(rbp)
                };
            });
    };

    prefix("number", 7, function(number) {
        return number;
    });

    prefix("(", 6, function() {
        let value = expression(0);
        if (token().type !== ")") throw "Expected closing parenthesis ')'";
        advance();
        return value;
    });

    prefix("-", 5);
    infix("^", 4, 3);
    infix("*", 2);
    infix("/", 2);
    infix("%", 2);
    infix("+", 1);
    infix("-", 1);

    while (token().type !== "(end)") {
        parseTree.push(expression(0));
    }
    return parseTree;
};

let evaluate = function (parseTree) {
    let output = "";

    let operators = {
        "+": function(a, b) {
            return a + b;
        },
        "-": function(a, b) {
            if (typeof b === "undefined") {
                return -a;
            }
            return a - b;
        },
        "*": function(a, b) {
            return a * b;
        },
        "/": function(a, b) {
            return a / b;
        },
        "%": function(a, b) {
            return a % b;
        },
        "^": function(a, b) {
            return Math.pow(a, b);
        }
    };

    let parseNode = function (node) {
        if (node.type === "number") return node.value;
        else if (operators[node.type]) {
            if (node.left) return operators[node.type](parseNode(node.left), parseNode(node.right));
            return operators[node.type](parseNode(node.right));
        }
    };

    for (let i = 0; i < parseTree.length; i++) {
        let value = parseNode(parseTree[i]);
        if (typeof value !== "undefined") {
            output += value + "\n";
        }
    }

    return output;
};