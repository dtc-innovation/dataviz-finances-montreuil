// Generated automatically by nearley, version 2.20.1
// http://github.com/Hardmath123/nearley
function id(x) { return x[0]; }
let Lexer = undefined;
let ParserRules = [
    {"name": "main", "symbols": ["_", "AS", "_"], "postprocess": ts => ts[1]},
    {"name": "P", "symbols": [{"literal":"("}, "_", "AS", "_", {"literal":")"}], "postprocess": ts => ts.filter(x => !!x)},
    {"name": "P", "symbols": ["SUBSET"], "postprocess": id},
    {"name": "M", "symbols": ["M", "_", {"literal":"*"}, "_", "P"], "postprocess": ts => ts.filter(x => !!x)},
    {"name": "M", "symbols": ["P"], "postprocess": id},
    {"name": "AS", "symbols": ["AS", "_", {"literal":"+"}, "_", "M"], "postprocess": ts => ts.filter(x => !!x)},
    {"name": "AS", "symbols": ["AS", "_", {"literal":"-"}, "_", "M"], "postprocess": ts => ts.filter(x => !!x)},
    {"name": "AS", "symbols": ["M"], "postprocess": id},
    {"name": "SUBSET", "symbols": ["RD"], "postprocess": id},
    {"name": "SUBSET", "symbols": ["FI"], "postprocess": id},
    {"name": "SUBSET", "symbols": ["RDFI"], "postprocess": id},
    {"name": "SUBSET", "symbols": ["CHAPITRE"], "postprocess": id},
    {"name": "SUBSET", "symbols": ["NATURE"], "postprocess": id},
    {"name": "SUBSET", "symbols": ["FONCTION"], "postprocess": id},
    {"name": "RD", "symbols": [{"literal":"R"}], "postprocess": id},
    {"name": "RD", "symbols": [{"literal":"D"}], "postprocess": id},
    {"name": "FI", "symbols": [{"literal":"F"}], "postprocess": id},
    {"name": "FI", "symbols": [{"literal":"I"}], "postprocess": id},
    {"name": "RDFI", "symbols": ["RD", "FI"], "postprocess": ts => ts.join('')},
    {"name": "CHAPITRE$ebnf$1", "symbols": [/[0-9]/]},
    {"name": "CHAPITRE$ebnf$1", "symbols": ["CHAPITRE$ebnf$1", /[0-9]/], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "CHAPITRE", "symbols": [{"literal":"C"}, "CHAPITRE$ebnf$1"], "postprocess": ts => ts[0]+ts[1].join('')},
    {"name": "NATURE$ebnf$1", "symbols": [/[0-9]/]},
    {"name": "NATURE$ebnf$1", "symbols": ["NATURE$ebnf$1", /[0-9]/], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "NATURE", "symbols": [{"literal":"N"}, "NATURE$ebnf$1"], "postprocess": ts => ts[0]+ts[1].join('')},
    {"name": "FONCTION$ebnf$1", "symbols": [/[0-9]/]},
    {"name": "FONCTION$ebnf$1", "symbols": ["FONCTION$ebnf$1", /[0-9]/], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "FONCTION", "symbols": [{"literal":"F"}, "FONCTION$ebnf$1"], "postprocess": ts => ts[0]+ts[1].join('')},
    {"name": "_$ebnf$1", "symbols": []},
    {"name": "_$ebnf$1", "symbols": ["_$ebnf$1", /[\s]/], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "_", "symbols": ["_$ebnf$1"], "postprocess": () => null}
];
let ParserStart = "main";
export default { Lexer, ParserRules, ParserStart };
