#!/usr/bin/env bash
# init.sh — Verifica que el entorno está listo para trabajar.
# Si falla algo, reporta y NO se debe continuar.
# En Windows ejecutar con Git Bash (cmd no ejecuta scripts .sh).

set -uo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT"

GREEN=$'\033[0;32m'
RED=$'\033[0;31m'
YELLOW=$'\033[1;33m'
NC=$'\033[0m'

ok() { printf '%s✔ %s%s\n' "$GREEN" "$1" "$NC"; }
fail() { printf '%s✘ %s%s\n' "$RED" "$1" "$NC"; }

# Detección del gestor de paquetes del destino (pnpm / npm / yarn)
# Se adapta en el proyecto sustituyendo PM por el gestor real si es necesario.
if [ -f pnpm-lock.yaml ]; then
  PM="pnpm"
elif [ -f package-lock.json ]; then
  PM="npm"
elif [ -f yarn.lock ]; then
  PM="yarn"
else
  PM="pnpm"
fi

FAILURES=0
run_check() {
  local description="$1"
  shift
  if "$@" >/dev/null 2>&1; then
    ok "$description"
  else
    fail "$description"
    FAILURES=$((FAILURES + 1))
  fi
}

echo "=== init.sh: verificando entorno ==="

echo ""
echo "--- Herramientas y dependencias ---"
run_check "node instalado" command -v node
run_check "gestor de paquetes instalado ($PM)" command -v "$PM"
run_check "dependencias instaladas (node_modules)" test -d node_modules

echo ""
echo "--- Archivos del harness ---"
run_check "AGENTS.md existe" test -f AGENTS.md
run_check "feature_list.json existe" test -f feature_list.json
run_check "progress/current.md existe" test -f progress/current.md

echo ""
echo "--- Formato ---"
run_check "formato de feature_list.json y progress/current.md" node scripts/check-format.mjs

echo ""
echo "--- Tests ---"
run_check "tests al 100% (node:test)" "$PM" test

echo ""
echo "--- Build ---"
run_check "build de producción" "$PM" build

echo ""
if [ "$FAILURES" -eq 0 ]; then
  printf '%s✔ El entorno está perfecto. Podemos empezar a trabajar.%s\n' "$GREEN" "$NC"
  exit 0
else
  printf '%s✘ %d comprobación(es) fallida(s). NO se debe continuar hasta resolverlo.%s\n' "$RED" "$FAILURES" "$NC"
  exit 1
fi