/**
 * Configuración de WA-JS. Debe cargarse ANTES de wppconnect-wa.js (ver manifest).
 * Desactiva todo lo que WA-JS envía a terceros por defecto (regla de oro 4 y Ley 29733):
 * - Google Analytics (errores y eventos con la versión de WhatsApp).
 * - Servidores externos de vista previa de enlaces (solo se usan al enviar, pero no enviamos nada).
 */
declare global {
  interface Window {
    WPPConfig?: Record<string, unknown>;
  }
}

window.WPPConfig = {
  disableGoogleAnalytics: true,
  linkPreviewApiServers: [],
  deviceName: false,
  sendStatusToDevice: false,
};

export {};
