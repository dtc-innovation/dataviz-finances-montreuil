@preprocessor module
# Grammar inspired by https://github.com/kach/nearley/blob/master/examples/calculator/arithmetic.ne

main -> _ AS _      {% ts => ts[1] %}

# Order of definition decides precedence

# Parentheses
P -> "(" _ AS _ ")"     {% ts => ts.filter(x => !!x) %}
    | SUBSET            {% id %}

# Multiplication
M -> M _ "*" _ P    {% ts => ts.filter(x => !!x) %}
    | P             {% id %}

# Addition and subtraction
AS -> AS _ "+" _ M  {% ts => ts.filter(x => !!x) %}
    | AS _ "-" _ M  {% ts => ts.filter(x => !!x) %}
    | M             {% id %}

# Subsets
SUBSET -> RD        {% id %}
    | FI            {% id %}
    | RDFI          {% id %}
#    | OPERATION     {% id %}
    | CHAPITRE      {% id %}
    | NATURE        {% id %}
    | FONCTION      {% id %}

RD -> "R"   {% id %}
    | "D"   {% id %}

FI -> "F"   {% id %}
    | "I"   {% id %}

RDFI -> RD FI                   {% ts => ts.join('') %}

# OPERATION -> "OR"               {% id %}

CHAPITRE -> "C" [0-9]:+         {% ts => ts[0]+ts[1].join('') %}

NATURE -> "N" [0-9]:+           {% ts => ts[0]+ts[1].join('') %}

FONCTION -> "F" [0-9]:+         {% ts => ts[0]+ts[1].join('') %}


# Whitespace
_ -> [\s]:*     {% () => null %}
