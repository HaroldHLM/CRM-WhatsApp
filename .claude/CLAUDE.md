# CRM Kanban interno para WhatsApp Web — contexto para Claude

Herramienta **interna** para el equipo de ventas (2 vendedores, cada uno en su PC, WhatsApp Business de la empresa).
No es un producto comercial: sin clientes externos, cobros ni Chrome Web Store.
Problema que resuelve: se pierden leads porque no se sabe en qué etapa está cada chat ni a quién dar seguimiento.

Estas bases pueden cambiar si hay una opción mejor: proponer el cambio, explicar el porqué y anotarlo en
`docs/decisiones.md`. No cambiar una regla en silencio.

## Estado actual

- **Paso actual: Paso 1 (v0.1.0)**: Kanban de chats con datos en `chrome.storage.local`.
- Implementado: barra superior fija (etapas con contador, etapa del chat abierto o "+ Agregar al CRM",
  botón Tablero), tablero de 5 columnas a pantalla completa con drag & drop, clic en tarjeta abre el chat,
  `firstContactAt` e historial de etapas guardados. La barra se oculta con el visor de imágenes/modales de WhatsApp.
- Lint con oxlint, rama `main` y remoto `origin` en GitHub (privado).
- Pendiente para cerrar el Paso 1: instalar el zip en las 2 PCs de ventas y usarlo en chats reales.

## Reglas de oro (no se negocian)

1. **Nada se envía solo.** La herramienta organiza y sugiere; el vendedor siempre hace clic para enviar.
   Nunca usar `WPP.chat.sendTextMessage` ni similares de forma automática ni masiva (riesgo de baneo).
2. **Pasos chicos y usables.** Cada paso termina en algo que ventas usa esa misma semana. Si no se usará esa
   semana, no entra.
3. **Un solo punto de contacto con WhatsApp.** Solo `src/bridge/` usa WA-JS. Si WhatsApp cambia, se arregla ahí.
4. **El contenido de los chats no se guarda en servidores.** Solo metadata del CRM (etapa, notas, fechas).
   Excepción futura: IA, solo cuando el vendedor la pide explícitamente.
5. **Ninguna clave secreta en la extensión.** La anon key de Supabase puede ir; la service role key y las
   API keys de IA solo en Edge Functions.
6. **Código propio.** No copiar código de MiCierro ni de otras extensiones; solo librerías open source.

## Seguridad y datos

- Teléfonos y nombres de clientes son datos personales: aplica la Ley 29733 y el D.S. 016-2024-JUS.
  Guardar solo lo necesario para vender, con acceso solo para el equipo.
- Permisos de la extensión: solo `https://web.whatsapp.com/*` y (desde el Paso 3) el dominio de Supabase.
  Todo permiso nuevo se anota en `docs/decisiones.md`.
- RLS activado en todas las tablas desde el día que exista Supabase.
- Nunca `dangerouslySetInnerHTML` ni `innerHTML` con texto que venga de chats.
- WA-JS envía datos a terceros por defecto (Google Analytics, servidores de link preview).
  `src/bridge/wa-config.ts` lo desactiva y debe cargarse antes de WA-JS. Revisarlo al actualizar WA-JS.

## Arquitectura

| Pieza           | Stack                                                                | Desde       |
| --------------- | -------------------------------------------------------------------- | ----------- |
| Bridge          | WA-JS (`@wppconnect/wa-js`) **versión exacta**                       | Paso 1      |
| UI              | React 18 + TypeScript, esbuild, Shadow DOM, CSS propio               | Paso 1      |
| Datos locales   | `chrome.storage.local`                                               | Paso 1      |
| Base de datos   | Supabase (Postgres + Auth + RLS), esquema `crm` del Supabase del ERP | Paso 3      |
| Edge Functions  | Supabase Edge Functions (secretos, IA)                               | Paso 6      |
| Export/gráficas | SheetJS o ExcelJS, Recharts                                          | Pasos 4 y 5 |

**Regla clave:** la UI nunca llama a WA-JS ni a Supabase directo.

- WhatsApp: `src/bridge/main.ts` (mundo MAIN) ↔ mensajes tipados en `src/contracts/bridge.ts` ↔
  `src/content/bridge-client.ts`.
- Datos: interfaz `LeadsRepository` en `src/repositories/`. En el Paso 3 se agrega la implementación con
  Supabase y la UI no se toca.

Sin backend propio. NestJS solo si algún día hace falta.

### Estructura real del repo

```
src/
├─ bridge/main.ts         # ÚNICO archivo que usa WA-JS (mundo MAIN). Solo lee y abre chats.
├─ contracts/bridge.ts    # mensajes bridge ↔ UI y sus validadores
├─ domain/lead.ts         # Lead, LeadEvent, STAGES, reglas puras (sin React ni WhatsApp)
├─ repositories/          # LeadsRepository: hoy chrome.storage, en el Paso 3 Supabase
├─ content/               # monta la UI en Shadow DOM y escucha al bridge
├─ ui/                    # componentes y estilos del Kanban
├─ background/            # (futuro) service worker, recordatorios
└─ features/              # (futuro) export-excel/, dashboard/, ai/
public/manifest.json      # manifest MV3 (subir "version" en cada paso)
scripts/build.mjs         # build con esbuild; CRM_COPY_TO copia dist/ a otra carpeta (WSL)
tests/                    # Vitest: domain, repositories, contracts
docs/decisiones.md        # una fila por decisión tomada
supabase/                 # (Paso 3) migrations/ y functions/
```

## Modelo de datos e integración con el ERP

- El CRM vive como **esquema `crm`** dentro del Supabase del ERP. Nada de microservicio aparte.
- El CRM solo **escribe** en `crm.*` (`crm.leads`, `crm.lead_eventos`, `crm.notas`).
- El CRM **lee** el catálogo de productos del ERP, nunca lo modifica.
- Lead → cliente solo con `crm.convertir_lead_a_cliente(lead_id)`: crea el cliente en el ERP, guarda
  `cliente_id` en el lead y lo marca Ganado. Las validaciones del cliente las pone el ERP.
- Tablas Postgres en `snake_case`; código TS en inglés (`firstContactAt` ↔ `primer_contacto_at`).

Campos que se capturan **antes** de que existan los reportes (sin historial no hay gráficas):

| Campo                                                                    | Reporte                      | Desde                           |
| ------------------------------------------------------------------------ | ---------------------------- | ------------------------------- |
| `primer_contacto_at` (`firstContactAt`)                                  | Contactos por día/semana/mes | Paso 1                          |
| Historial de etapas (`LeadEvent`)                                        | Embudo y tiempos por etapa   | Paso 1                          |
| `origen` (Facebook, Instagram, TikTok, Marketplace, referido, web, otro) | Por red                      | Paso 2                          |
| `producto_interes_id`                                                    | Por producto                 | Paso 2 (catálogo ERP en Paso 3) |
| Departamento, provincia, distrito (ubigeo)                               | Por lugar                    | Paso 2                          |
| `vendedor_id`                                                            | Por vendedor                 | Paso 3                          |

En el Paso 3 se migra lo guardado localmente en cada PC a Supabase. Quitar una tarjeta **no** borra su historial.

## Roadmap

1. **Paso 1 (actual):** Kanban con 5 columnas fijas, drag & drop, `chrome.storage.local`, instalación sin publicar.
2. **Paso 2:** Ficha del lead: origen, producto de interés, ubigeo, notas, etiquetas, respuestas rápidas
   (el vendedor hace clic para enviar), recordatorios.
3. **Paso 3:** Supabase (esquema `crm`, Auth, RLS), login de vendedores, migración de datos locales,
   conversión a cliente del ERP.
4. **Paso 4:** Exportar a Excel.
5. **Paso 5:** Dashboard con gráficas (por red, producto, lugar, vendedor, contactos por periodo).
6. **Paso 6:** IA vía Edge Functions (alcance por definir).
7. **Paso 7:** Facebook Marketplace (empieza con investigación de viabilidad respecto a los términos de Meta).

Un paso se cierra cuando ventas ya lo usa en chats reales; recién ahí empieza el siguiente.
El orden de los pasos 4 a 7 puede cambiar según lo que pida ventas.

## Comandos

```bash
npm install
npm run check        # tsc + oxlint + vitest + build. Debe pasar antes de cada commit.
npm run lint         # oxlint --deny-warnings
npm run dev          # build en watch → dist/
CRM_COPY_TO=/mnt/c/crm-whatsapp-dev npm run dev   # WSL: copia dist/ a C:\crm-whatsapp-dev
npm run format       # prettier
```

Entregar una versión: subir `version` en `public/manifest.json`, `npm run check`, comprimir el contenido
de `dist/` como `crm-whatsapp-extension-vX.Y.Z.zip` (se copia a `C:\crm-whatsapp-releases`).

Ojo en WSL: si `npm run dev` con `CRM_COPY_TO` no está corriendo, Chrome sigue cargando la versión vieja.

Probar en WhatsApp Web: cargar `dist/` (o `C:\crm-whatsapp-dev` en WSL) en `chrome://extensions` con
"Cargar descomprimida"; tras cada cambio, ↻ en la extensión y recargar `web.whatsapp.com`.

## Convenciones

- TypeScript estricto, Prettier y oxlint (`.oxlintrc.json`, reglas compatibles con ESLint; se usa en vez
  de ESLint porque typescript-eslint no soporta TypeScript 7). Lint bloquea importar `@wppconnect/*` fuera
  del bridge y `dangerouslySetInnerHTML`. Build verde antes de cada commit.
- Git: rama `main` + ramas cortas `feat/…`, `fix/…`; Conventional Commits en español
  (`feat: notas en la ficha del lead`).
- Código en inglés; textos de la UI en español; tablas Postgres en `snake_case`.
- Tests: solo unitarios con Vitest para `domain/`, `repositories/` y `contracts/`. La UI se prueba a mano.
- WA-JS fijado a versión exacta. Si WhatsApp Web se rompe, el bridge se arregla antes que cualquier feature.
- Versión del manifest (`0.1.0`, `0.2.0`…) sube en cada paso, con una línea en `docs/decisiones.md`.
- UI: cubrir estados de carga, vacío y error.

## Definition of Done

- [ ] Cumple los criterios de aceptación de la tarea
- [ ] Tipos estrictos, lint y build en verde (`npm run check`)
- [ ] Tests de domain/repositories actualizados si cambiaron
- [ ] Sin permisos nuevos en la extensión sin anotarlos en `docs/decisiones.md`
- [ ] El contenido de los chats no se guarda en servidores
- [ ] Usado en chats reales de ventas antes de cerrar el paso
- [ ] Textos de UI en español revisados; estados de carga, vacío y error cubiertos
- [ ] Decisión anotada en `docs/decisiones.md`, si hubo alguna
- [ ] PR revisado y fusionado a `main`

## Cómo debe trabajar Claude en este repo

- Antes de proponer una feature, verificar que pertenece al paso actual. Si es de un paso posterior, decirlo.
- Toda lectura o acción sobre WhatsApp va en `src/bridge/` + un mensaje en `src/contracts/`; nunca WA-JS en la UI.
- Todo acceso a datos va por un repositorio con interfaz; la UI no conoce `chrome.storage` ni Supabase.
- Lógica pura en `src/domain/` con tests; mantener `domain/` libre de React, Chrome y WhatsApp.
- Correr `npm run check` después de cambios de código y reportar el resultado real.
- Anotar en `docs/decisiones.md` cada decisión técnica o de alcance.
- Commits y push solo cuando el usuario lo pida.
