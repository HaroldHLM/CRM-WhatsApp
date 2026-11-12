// Estilos aislados dentro del Shadow DOM: no afectan a WhatsApp Web ni al revés.
export const styles = `
:host { all: initial; }
* { box-sizing: border-box; font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; }
button, select { font: inherit; cursor: pointer; }

.fab-group { position: fixed; right: 20px; bottom: 20px; z-index: 2147483000; display: flex; gap: 8px; align-items: center; }
.fab { background: #1f2a37; color: #fff; border: 0; border-radius: 999px; padding: 10px 18px; font-size: 14px; font-weight: 600; box-shadow: 0 4px 14px rgba(0,0,0,.25); }
.fab:hover { background: #111827; }
.fab-add { background: #fff; color: #1f2a37; border: 1px solid #cbd5e1; border-radius: 999px; padding: 9px 14px; font-size: 13px; font-weight: 600; box-shadow: 0 2px 8px rgba(0,0,0,.12); }
.fab-stage { background: #fff; color: #1f2a37; border: 1px solid #cbd5e1; border-radius: 999px; padding: 8px 12px; font-size: 13px; }

.board { position: fixed; inset: 16px 16px 76px 16px; z-index: 2147482999; background: #f8fafc; color: #0f172a; border-radius: 12px; box-shadow: 0 12px 40px rgba(0,0,0,.3); display: flex; flex-direction: column; overflow: hidden; }
.board-head { display: flex; align-items: center; gap: 12px; padding: 14px 18px; border-bottom: 1px solid #e2e8f0; background: #fff; flex-wrap: wrap; }
.board-head h1 { font-size: 16px; margin: 0; }
.status { font-size: 12px; padding: 3px 8px; border-radius: 999px; }
.status.ok { background: #dcfce7; color: #166534; }
.status.wait { background: #fef9c3; color: #854d0e; }
.status.err { background: #fee2e2; color: #991b1b; }

.columns { flex: 1; display: grid; grid-template-columns: repeat(5, minmax(200px, 1fr)); gap: 12px; padding: 14px; overflow: auto; }
.column { background: #eef2f6; border-radius: 10px; padding: 10px; display: flex; flex-direction: column; gap: 8px; min-height: 0; overflow-y: auto; border-top: 4px solid #94a3b8; transition: background .15s; }
.column.over { background: #dbeafe; }
.stage-nuevo { border-top-color: #64748b; }
.stage-en_conversacion { border-top-color: #2563eb; }
.stage-cotizado { border-top-color: #d97706; }
.stage-ganado { border-top-color: #16a34a; }
.stage-perdido { border-top-color: #dc2626; }
.column h2 { font-size: 13px; margin: 2px 2px 4px; display: flex; justify-content: space-between; text-transform: uppercase; letter-spacing: .03em; color: #334155; }
.count { background: #fff; border-radius: 999px; padding: 0 8px; font-size: 12px; }
.empty { font-size: 12px; color: #64748b; text-align: center; border: 1px dashed #cbd5e1; border-radius: 8px; padding: 16px 8px; margin: 0; }

.card { position: relative; background: #fff; border-radius: 8px; padding: 10px 28px 10px 10px; display: flex; flex-direction: column; gap: 2px; box-shadow: 0 1px 2px rgba(0,0,0,.08); cursor: grab; border: 1px solid transparent; }
.card:hover { border-color: #94a3b8; }
.card.current { border-color: #2563eb; }
.card strong { font-size: 14px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.phone { font-size: 12px; color: #475569; }
.meta { font-size: 11px; color: #64748b; }
.remove { position: absolute; top: 4px; right: 4px; width: 22px; height: 22px; border: 0; background: transparent; color: #94a3b8; border-radius: 4px; font-size: 16px; line-height: 1; }
.remove:hover { background: #fee2e2; color: #b91c1c; }
`;
