import { BAR_HEIGHT } from '../ui/styles';

const STYLE_ID = 'crm-wa-layout';
const MAX_DEPTH = 6;
const FIXED_ATTR = 'data-crm-fit';
/** Atributo en el host del Shadow DOM mientras WhatsApp muestra una capa a pantalla completa. */
export const OVERLAY_ATTR = 'data-wa-overlay';

/**
 * Reserva espacio arriba para la barra del CRM sin tapar nada de WhatsApp Web.
 * Solo es presentación: no lee datos de WhatsApp (eso es tarea del bridge).
 *
 * 1. Baja el contenedor #app de WhatsApp BAR_HEIGHT px.
 * 2. WhatsApp dimensiona algunos contenedores internos con el alto de la ventana (100vh), así que
 *    quedan BAR_HEIGHT px más altos que #app y el navegador desplaza #app al enfocar la caja de
 *    escribir, escondiendo la cabecera del chat. `fitInside` ajusta esos contenedores al 100% de su padre.
 * 3. Si aun así #app se desplaza, se vuelve a 0.
 * 4. Algunas capas de WhatsApp (visor de imágenes, modales) se posicionan contra la ventana y empiezan
 *    en y=0. Como #app empieza debajo de la barra, si hay algo de WhatsApp en la franja de la barra es
 *    una de esas capas: se marca el host con OVERLAY_ATTR y la barra se oculta hasta que se cierre.
 *
 * Si WhatsApp cambia el id #app, la barra queda encima del contenido sin romper nada.
 */
export function reserveTopBar(host: HTMLElement) {
  injectStyle();

  let scheduled = false;
  const schedule = () => {
    if (scheduled) return;
    scheduled = true;
    setTimeout(() => {
      scheduled = false;
      fitInside();
      host.toggleAttribute(OVERLAY_ATTR, waOverlayUnderBar(host));
    }, 100);
  };

  let observedApp: HTMLElement | null = null;
  const watchApp = () => {
    const app = document.getElementById('app');
    if (!app || app === observedApp) return;
    observedApp = app;
    app.addEventListener('scroll', () => {
      if (app.scrollTop !== 0) app.scrollTop = 0;
    });
    new MutationObserver(schedule).observe(app, { childList: true, subtree: true });
    schedule();
  };

  watchApp();
  new MutationObserver(() => {
    watchApp();
    schedule();
  }).observe(document.body, { childList: true });
  window.addEventListener('resize', schedule);
}

function injectStyle() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    #app {
      position: fixed !important;
      top: ${BAR_HEIGHT}px !important;
      left: 0 !important;
      right: 0 !important;
      bottom: 0 !important;
      width: auto !important;
      height: auto !important;
      overflow: hidden !important;
    }
    [${FIXED_ATTR}] {
      height: 100% !important;
      max-height: 100% !important;
    }
  `;
  (document.head ?? document.documentElement).appendChild(style);
}

/** Recorre solo la "columna" de contenedores que ocupan todo el alto de #app. */
function fitInside() {
  const app = document.getElementById('app');
  if (!app) return;
  if (app.scrollTop !== 0) app.scrollTop = 0;

  const max = app.clientHeight;
  let level: HTMLElement[] = [app];
  for (let depth = 0; depth < MAX_DEPTH && level.length > 0; depth++) {
    const next: HTMLElement[] = [];
    for (const parent of level) {
      const overflowY = getComputedStyle(parent).overflowY;
      // Dentro de un contenedor con scroll, que el hijo sea más alto es lo normal (listas, mensajes).
      if (parent !== app && (overflowY === 'auto' || overflowY === 'scroll')) continue;
      for (const child of Array.from(parent.children)) {
        if (!(child instanceof HTMLElement)) continue;
        const cs = getComputedStyle(child);
        if (cs.position === 'fixed' || cs.display === 'none') continue;
        const height = child.getBoundingClientRect().height;
        if (height > max + 1 && !child.hasAttribute(FIXED_ATTR)) {
          child.setAttribute(FIXED_ATTR, '');
        }
        if (height >= max - 1) next.push(child);
      }
    }
    level = next;
  }
  if (app.scrollTop !== 0) app.scrollTop = 0;
}

/** ¿Hay algún elemento de WhatsApp en la franja de la barra? (aparte de body/html y nuestro host) */
function waOverlayUnderBar(host: HTMLElement): boolean {
  const y = Math.round(BAR_HEIGHT / 2);
  const xs = [0.1, 0.5, 0.9].map((f) => Math.round(window.innerWidth * f));
  return xs.some((x) =>
    document
      .elementsFromPoint(x, y)
      .some((el) => el !== host && el !== document.body && el !== document.documentElement),
  );
}
