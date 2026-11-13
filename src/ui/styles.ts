/** Alto de la barra superior del CRM; WhatsApp Web se desplaza hacia abajo esta cantidad. */
export const BAR_HEIGHT = 44;

// Estilos aislados dentro del Shadow DOM: no afectan a WhatsApp Web ni al revés.
export const styles = `
:host {
  all: initial;
  --bg: #f0f2f5;
  --surface: #ffffff;
  --surface-2: #e9edef;
  --text: #111b21;
  --muted: #667781;
  --line: #d1d7db;
  --accent: #008069;
  --accent-text: #ffffff;
  --focus: #2563eb;
}
:host-context(.dark) {
  --bg: #111b21;
  --surface: #202c33;
  --surface-2: #2a3942;
  --text: #e9edef;
  --muted: #8696a0;
  --line: #313d45;
  --accent: #00a884;
  --accent-text: #111b21;
}
* { box-sizing: border-box; font-family: "Segoe UI", system-ui, -apple-system, Roboto, sans-serif; }
button, select { font: inherit; color: inherit; cursor: pointer; }
:focus-visible { outline: 2px solid var(--focus); outline-offset: 1px; }
.muted { color: var(--muted); font-size: 12px; white-space: nowrap; }

/* Colores por etapa */
.stage-nuevo { --stage: #64748b; }
.stage-en_conversacion { --stage: #2563eb; }
.stage-cotizado { --stage: #d97706; }
.stage-ganado { --stage: #16a34a; }
.stage-perdido { --stage: #dc2626; }
.dot { width: 8px; height: 8px; border-radius: 50%; background: var(--stage, #94a3b8); flex: none; }

/* Mientras WhatsApp muestra una capa a pantalla completa (visor de imágenes, modales) la barra se oculta. */
:host([data-wa-overlay]) .bar,
:host([data-wa-overlay]) .menu,
:host([data-wa-overlay]) .backdrop { visibility: hidden; opacity: 0; }

/* Barra superior */
.bar {
  position: fixed; top: 0; left: 0; right: 0; height: ${BAR_HEIGHT}px; z-index: 2147483000;
  display: flex; align-items: center; gap: 10px; padding: 0 12px;
  background: var(--surface); color: var(--text); border-bottom: 1px solid var(--line); font-size: 13px;
  transition: opacity .12s;
}
.brand { display: flex; align-items: center; gap: 6px; font-weight: 700; letter-spacing: .02em; flex: none; }
.status-dot { width: 8px; height: 8px; border-radius: 50%; }
.status-dot.ok { background: #16a34a; }
.status-dot.wait { background: #eab308; }
.status-dot.err { background: #dc2626; }
.bar-error { color: #dc2626; font-size: 12px; max-width: 260px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

.chips { display: flex; gap: 6px; flex: 1; min-width: 0; overflow-x: auto; scrollbar-width: none; }
.chips::-webkit-scrollbar { display: none; }
.chip {
  display: inline-flex; align-items: center; gap: 6px; flex: none;
  border: 1px solid var(--line); background: var(--surface); border-radius: 999px; padding: 4px 6px 4px 10px;
}
.chip:hover, .chip.open { background: var(--surface-2); }
.chip-count { background: var(--surface-2); border-radius: 999px; padding: 0 7px; font-size: 12px; font-weight: 600; }
.chip.open .chip-count { background: var(--surface); }

.active { display: flex; align-items: center; gap: 8px; padding-left: 10px; border-left: 1px solid var(--line); min-width: 0; flex: none; max-width: 360px; }
.active-name { font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 170px; }
.stage-select {
  background: var(--surface); border: 1px solid var(--stage); border-left-width: 4px; border-radius: 6px; padding: 3px 6px;
}

.btn { border: 1px solid var(--line); background: var(--surface); border-radius: 6px; padding: 4px 12px; font-weight: 600; flex: none; white-space: nowrap; }
.btn:hover { background: var(--surface-2); }
.btn-primary { background: var(--accent); border-color: var(--accent); color: var(--accent-text); }
.btn-primary:hover { background: var(--accent); filter: brightness(1.08); }
kbd { font: inherit; font-size: 11px; border: 1px solid var(--line); border-radius: 4px; padding: 0 4px; margin-left: 4px; color: var(--muted); }

/* Menú de una etapa */
.backdrop { position: fixed; inset: 0; z-index: 2147483001; }
.menu {
  position: fixed; top: ${BAR_HEIGHT + 4}px; z-index: 2147483002; width: 280px; max-height: 60vh; overflow-y: auto;
  background: var(--surface); color: var(--text); border: 1px solid var(--line); border-radius: 10px;
  box-shadow: 0 8px 24px rgba(0,0,0,.18); font-size: 13px;
}
.menu-head { display: flex; align-items: center; gap: 6px; padding: 10px 12px; font-weight: 700; border-bottom: 1px solid var(--line); }
.menu-empty { margin: 0; padding: 14px 12px; color: var(--muted); }
.menu-list { list-style: none; margin: 0; padding: 4px; }
.menu-item { width: 100%; display: flex; justify-content: space-between; gap: 8px; align-items: center; text-align: left; background: transparent; border: 0; border-radius: 6px; padding: 8px; }
.menu-item:hover { background: var(--surface-2); }
.menu-item.current { box-shadow: inset 3px 0 0 var(--accent); }
.menu-name { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

/* Tablero a pantalla completa, debajo de la barra */
.board {
  position: fixed; top: ${BAR_HEIGHT}px; left: 0; right: 0; bottom: 0; z-index: 2147482999;
  background: var(--bg); color: var(--text); display: flex; flex-direction: column;
}
.board-head { display: flex; align-items: center; gap: 12px; padding: 12px 16px; flex-wrap: wrap; }
.board-head h1 { font-size: 16px; margin: 0; }
.board-close { margin-left: auto; }

.columns { flex: 1; display: grid; grid-template-columns: repeat(5, minmax(200px, 1fr)); gap: 12px; padding: 0 16px 16px; overflow: auto; }
.column { background: var(--surface-2); border-radius: 10px; padding: 10px; display: flex; flex-direction: column; gap: 8px; min-height: 0; overflow-y: auto; border-top: 4px solid var(--stage); transition: background .15s; }
.column.over { background: color-mix(in srgb, var(--stage) 18%, var(--surface-2)); }
.column h2 { font-size: 12px; margin: 2px 2px 4px; display: flex; justify-content: space-between; text-transform: uppercase; letter-spacing: .04em; color: var(--muted); }
.count { background: var(--surface); color: var(--text); border-radius: 999px; padding: 0 8px; font-size: 12px; }
.empty { font-size: 12px; color: var(--muted); text-align: center; border: 1px dashed var(--line); border-radius: 8px; padding: 16px 8px; margin: 0; }

.card { position: relative; background: var(--surface); border-radius: 8px; padding: 10px 28px 10px 10px; display: flex; flex-direction: column; gap: 2px; box-shadow: 0 1px 2px rgba(0,0,0,.08); cursor: grab; border: 1px solid transparent; }
.card:hover { border-color: var(--line); }
.card.current { border-color: var(--accent); }
.card strong { font-size: 14px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.phone { font-size: 12px; color: var(--muted); }
.meta { font-size: 11px; color: var(--muted); }
.remove { position: absolute; top: 4px; right: 4px; width: 22px; height: 22px; border: 0; background: transparent; color: var(--muted); border-radius: 4px; font-size: 16px; line-height: 1; }
.remove:hover { background: #fee2e2; color: #b91c1c; }
`;
