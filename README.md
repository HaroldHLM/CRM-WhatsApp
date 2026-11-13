# CRM Ventas WhatsApp (interno) — v0.1.0 · Paso 1

Kanban de ventas sobre WhatsApp Web para el equipo comercial. **No envía mensajes**: solo organiza chats.

## Qué hace el Paso 1

- Botón **"+ Agregar chat al CRM"** sobre el chat abierto (solo chats individuales, no grupos).
- Selector de etapa del chat abierto, sin abrir el tablero.
- Tablero con 5 columnas: Nuevo → En conversación → Cotizado → Ganado → Perdido. Se arrastran tarjetas entre columnas.
- Clic en una tarjeta → abre ese chat en WhatsApp Web.
- Guarda `firstContactAt` y el historial de cambios de etapa (base de los reportes del Paso 5).
- Datos en `chrome.storage.local` de cada PC (cada vendedor ve sus propios leads hasta el Paso 3).

## Compatibilidad

La misma extensión funciona sin cambios en **Windows y macOS** (y Linux), en cualquier navegador basado en Chromium: Google Chrome, Microsoft Edge o Brave. No hay nada específico de un sistema operativo: corre dentro de WhatsApp Web.

## Instalar en una PC (vendedor)

1. Descomprimir `crm-whatsapp-extension-vX.Y.Z.zip` en una carpeta fija que no se vaya a borrar:
   - Windows: `C:\crm-whatsapp`
   - macOS: `~/Applications/crm-whatsapp` (o cualquier carpeta del usuario)
2. Abrir la página de extensiones y activar **Modo de desarrollador** (arriba a la derecha):
   - Chrome: `chrome://extensions` · Edge: `edge://extensions` · Brave: `brave://extensions`
3. Clic en **Cargar descomprimida** y elegir la carpeta que contiene `manifest.json`.
4. Abrir o recargar `https://web.whatsapp.com`. Abajo a la derecha aparece el botón **CRM · 0**.

Para actualizar: reemplazar el contenido de la carpeta y pulsar ↻ en la tarjeta de la extensión. Los datos se conservan.

## Desarrollo (VS Code, Windows o macOS)

Requisitos: [Node.js](https://nodejs.org) 20 o superior (recomendado 24 LTS, ver `.nvmrc`), Git y VS Code.

1. Abrir la carpeta del proyecto en VS Code (`code .` desde la terminal o _Archivo → Abrir carpeta_).
2. Aceptar las extensiones recomendadas (Prettier, Vitest, EditorConfig).
3. En la terminal integrada:

```bash
npm install
npm run check   # tipos + tests + build
npm run dev     # build en modo watch
```

También hay tareas listas en _Terminal → Ejecutar tarea_: **Build extensión** (`Ctrl+Shift+B` en Windows, `Cmd+Shift+B` en Mac), **Dev (watch)** y **Check**.

Flujo de trabajo: con `npm run dev` corriendo, cargar la carpeta `dist/` en `chrome://extensions` una sola vez; tras cada cambio, pulsar ↻ en la extensión y recargar WhatsApp Web.

Para entregar una versión: subir `version` en `public/manifest.json`, correr `npm run check` y comprimir el contenido de `dist/`.

**Notas multiplataforma:** `.gitattributes` y `.editorconfig` fuerzan finales de línea LF en ambos sistemas, y los scripts de build usan solo Node (sin comandos de shell), así que funcionan igual en PowerShell, CMD o la terminal de Mac.

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
