// Botón Copiar en bloques de código (feature 2026-09-19).
// Astro/Shiki no trae botón de copiar: este módulo añade uno por cada
// pre.astro-code del detalle. JS de runtime justificado (excepción a
// estático por defecto, precedentes search 3/4/5/6): sin JS no hay
// portapapeles. Idempotente ante re-navegaciones del ClientRouter: cada
// pre se marca con dataset.copyReady y la segunda llamada no duplica.
// textContent (no innerText) para no depender del layout ni romper en
// pruebas; clipboard API con fallback a execCommand si no está disponible.

const ICON_COPY =
  '<svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="5.5" y="5.5" width="8" height="8" rx="1.5"/><path d="M10.5 5.5v-2a1.5 1.5 0 0 0-1.5-1.5H4A1.5 1.5 0 0 0 2.5 3.5v5A1.5 1.5 0 0 0 4 10h1.5"/></svg>';
const LABEL_COPY = 'Copiar código';
const LABEL_DONE = '¡Copiado!';
// Feature 54: confirmación fiable. Región role="status" compartida (en
// code-copy.astro) y texto visible «Copiado» durante 2000 ms.
const STATUS_DONE = 'Código copiado';
const STATUS_FAIL = 'No se pudo copiar el código';
const DONE_HTML = `${ICON_COPY}<span class="code-copy__done">Copiado</span>`;
const DONE_MS = 2000;

export function initCodeCopy(): void {
  if (typeof document === 'undefined') return;
  const blocks = document.querySelectorAll('pre.astro-code');
  blocks.forEach((pre) => {
    // Chequeo estructural (no instanceof HTMLElement) para no depender del
    // constructor global: funciona en el navegador y en los fakes de test.
    if (typeof (pre as HTMLElement).appendChild !== 'function') return;
    if (pre.dataset.copyReady === 'true') return;
    pre.dataset.copyReady = 'true';
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'code-copy';
    button.setAttribute('aria-label', LABEL_COPY);
    button.innerHTML = ICON_COPY;
    button.addEventListener('click', () => copyBlock(pre, button));
    wrapBlock(pre).appendChild(button);
  });
}

// Feature 62: el pre tiene overflow-x: auto; si el botón colgara de él se iría con
// el scroll horizontal. Se envuelve en div.code-block (position: relative) y el
// botón se ancla al envoltorio, que no se desplaza.
function wrapBlock(pre: HTMLElement): HTMLElement {
  const wrap = document.createElement('div');
  wrap.className = 'code-block';
  pre.parentNode?.insertBefore(wrap, pre);
  wrap.appendChild(pre);
  return wrap;
}

async function copyBlock(pre: HTMLElement, button: HTMLButtonElement): Promise<void> {
  const code = pre.querySelector('code');
  const text = (code?.textContent ?? pre.textContent) || '';
  const done = await writeText(text.trimEnd());
  announce(done ? STATUS_DONE : STATUS_FAIL);
  if (!done) return;
  button.setAttribute('aria-label', LABEL_DONE);
  button.classList.add('is-copied');
  button.innerHTML = DONE_HTML;
  setTimeout(() => {
    button.setAttribute('aria-label', LABEL_COPY);
    button.classList.remove('is-copied');
    button.innerHTML = ICON_COPY;
  }, DONE_MS);
}

function announce(message: string): void {
  const region = document.querySelector('[data-code-copy-status]');
  if (region === null) return;
  // Se vacía antes de escribir para que una segunda copia se vuelva a anunciar.
  region.textContent = '';
  region.textContent = message;
}

async function writeText(text: string): Promise<boolean> {
  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch { return fallbackCopy(text); }
  return fallbackCopy(text);
}

function fallbackCopy(text: string): boolean {
  try {
    const area = document.createElement('textarea');
    area.value = text;
    document.body.appendChild(area);
    area.select();
    const ok = document.execCommand('copy');
    area.remove();
    return ok;
  } catch { return false; }
}
