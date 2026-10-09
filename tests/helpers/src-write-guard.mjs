// Guarda estática «ningún test escribe dentro de src/» (feature 59, REQ-59-06).
// Helper de tests (no es *.test.mjs). Análisis léxico ligero, sin dependencias:
//  - Una expresión «apunta a src» si contiene un literal con «src/», el
//    segmento suelto 'src' (join/resolve) o una variable ya contaminada.
//  - Las variables se contaminan por declaración o reasignación («x = …»).
//    La expresión empieza tras los espacios/saltos que siguen al «=» y llega
//    hasta «;» o un fin de línea con paréntesis equilibrados (cubre «const p =
//    ⏎ join(…)» y argumentos repartidos en varias líneas); la contaminación
//    se propaga hasta un punto fijo. Una expresión partida en varias líneas
//    FUERA de paréntesis (p. ej. «a +⏎ 'src/x'») no se sigue: limitación aceptada.
//  - Se vigilan las APIs de escritura/borrado de node:fs (síncronas, de
//    callback y de node:fs/promises): la ruta es el primer argumento y, en
//    rename/copy/cp, también el destino (segundo argumento).
// Limitación aceptada: un fixture en un directorio temporal que imite la
// estructura 'src/...' (p. ej. join(tmp, 'src', 'x.css')) se marca igual;
// ningún test lo necesita hoy y, si hiciera falta, debe usar otro nombre.
const WATCHED = ['writeFileSync', 'appendFileSync', 'unlinkSync', 'rmSync', 'rmdirSync', 'mkdirSync', 'renameSync',
  'copyFileSync', 'cpSync', 'createWriteStream', 'writeFile', 'appendFile', 'unlink', 'rm', 'rmdir', 'mkdir',
  'rename', 'copyFile', 'cp'];
const TWO_PATHS = new Set(['renameSync', 'copyFileSync', 'cpSync', 'rename', 'copyFile', 'cp']);
const IDENT = /[A-Za-z0-9_$]/;
const QUOTES = new Set(["'", '"', '`']);

// Avanza desde `start` hasta el fin de la expresión: «;» o salto de línea (o
// los cierres en `stops`) con profundidad 0; respeta cadenas y paréntesis.
function scanExpression(text, start, stops = ';\n') {
  let depth = 0;
  for (let i = start; i < text.length; i++) {
    const ch = text[i];
    if (QUOTES.has(ch)) {
      const end = text.indexOf(ch, i + 1);
      i = end < 0 ? text.length : end;
    } else if ('([{'.includes(ch)) depth++;
    else if (')]}'.includes(ch)) {
      if (depth === 0) return i;
      depth--;
    } else if (depth === 0 && stops.includes(ch)) return i;
  }
  return text.length;
}

// Argumentos de nivel superior de la llamada cuyo «(» está en `open`.
function callArgs(text, open) {
  const args = [];
  let from = open + 1;
  for (;;) {
    const end = scanExpression(text, from, ',');
    args.push(text.slice(from, end).trim());
    if (end >= text.length || text[end] !== ',') return args;
    from = end + 1;
  }
}

const hasWord = (expr, word) => {
  for (let at = expr.indexOf(word); at >= 0; at = expr.indexOf(word, at + 1)) {
    const before = expr[at - 1] ?? ' ';
    const after = expr[at + word.length] ?? ' ';
    if (!IDENT.test(before) && !IDENT.test(after) && before !== '.') return true;
  }
  return false;
};
const SRC_LITERAL = /['"`][^'"`]*src\/|['"`]src['"`]/;
const dirty = (expr, tainted) => SRC_LITERAL.test(expr) || [...tainted].some((name) => hasWord(expr, name));

export function writesIntoSrc(source) {
  // Declaraciones y reasignaciones «nombre =» (no «==», «=>» ni «obj.prop =»);
  // la expresión empieza tras los espacios y saltos de línea que siguen al «=».
  const assigns = [...source.matchAll(/(?<![A-Za-z0-9_$.])([A-Za-z_$][A-Za-z0-9_$]*)\s*=(?![=>])\s*/g)]
    .map((m) => [m[1], source.slice(m.index + m[0].length, scanExpression(source, m.index + m[0].length))]);
  const tainted = new Set();
  for (let changed = true; changed; ) {
    changed = false;
    for (const [name, expr] of assigns) {
      if (!tainted.has(name) && dirty(expr, tainted)) { tainted.add(name); changed = true; }
    }
  }
  const hits = [];
  for (const m of source.matchAll(new RegExp(`(?<![A-Za-z0-9_$])(${WATCHED.join('|')})[(]`, 'g'))) {
    const args = callArgs(source, m.index + m[0].length - 1);
    const paths = TWO_PATHS.has(m[1]) ? args.slice(0, 2) : args.slice(0, 1);
    if (paths.some((arg) => dirty(arg, tainted))) hits.push(`${m[1]}(${paths.join(', ')})`);
  }
  return hits;
}
