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
    pre.appendChild(button);
  });
}

async function copyBlock(pre: HTMLElement, button: HTMLButtonElement): Promise<void> {
  const code = pre.querySelector('code');
  const text = (code?.textContent ?? pre.textContent) || '';
  const done = await writeText(text.trimEnd());
  if (!done) return;
  button.setAttribute('aria-label', LABEL_DONE);
  button.classList.add('is-copied');
  setTimeout(() => {
    button.setAttribute('aria-label', LABEL_COPY);
    button.classList.remove('is-copied');
  }, 1500);
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
