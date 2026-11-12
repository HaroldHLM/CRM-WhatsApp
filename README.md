# CRM Ventas WhatsApp (interno) — v0.1.0 · Paso 1

Kanban de ventas sobre WhatsApp Web para el equipo comercial. **No envía mensajes**: solo organiza chats.

## Qué hace el Paso 1

- Botón **"+ Agregar chat al CRM"** sobre el chat abierto (solo chats individuales, no grupos).
- Selector de etapa del chat abierto, sin abrir el tablero.
- Tablero con 5 columnas: Nuevo → En conversación → Cotizado → Ganado → Perdido. Se arrastran tarjetas entre columnas.
- Clic en una tarjeta → abre ese chat en WhatsApp Web.
- Guarda `firstContactAt` y el historial de cambios de etapa (base de los reportes del Paso 5).
- Datos en `chrome.storage.local` de cada PC (cada vendedor ve sus propios leads hasta el Paso 3).

## Instalar en una PC (vendedor)

1. Descomprimir `crm-whatsapp-extension-v0.1.0.zip` en una carpeta fija, por ejemplo `C:\crm-whatsapp`. No borrarla después.
2. En Chrome abrir `chrome://extensions` y activar **Modo de desarrollador** (arriba a la derecha).
3. Clic en **Cargar descomprimida** y elegir la carpeta (la que contiene `manifest.json`).
4. Abrir o recargar `https://web.whatsapp.com`. Abajo a la derecha aparece el botón **CRM · 0**.

Para actualizar: reemplazar el contenido de la carpeta y pulsar ↻ en la tarjeta de la extensión. Los datos se conservan.

## Desarrollo

Requisitos: Node 20+.

```bash
npm install
npm run check   # tipos + tests + build
npm run dev     # build en modo watch (recargar la extensión tras cada cambio)
```

La extensión compilada queda en `dist/`.

## Estructura

```
src/
├─ bridge/main.ts         # ÚNICO archivo que usa WA-JS (mundo MAIN). Solo lee y abre chats.
├─ contracts/bridge.ts    # mensajes bridge ↔ UI y sus validadores
├─ domain/lead.ts         # Lead, etapas, reglas (sin React ni WhatsApp)
├─ repositories/          # LeadsRepository: hoy chrome.storage, en el Paso 3 Supabase
├─ content/               # monta la UI en Shadow DOM y escucha al bridge
└─ ui/                    # componentes y estilos del Kanban
tests/                    # Vitest: domain, repositories, contracts
```

## Si WhatsApp Web se rompe

Síntoma: el estado del tablero queda en "Esperando a WhatsApp Web…" o muestra un error.
Revisar si hay una versión nueva de `@wppconnect/wa-js`, actualizarla a una versión exacta, correr `npm run check`, probar en una PC y luego distribuir.
