// blockDevTools.js
/**
 * Attaches listeners that block DevTools, context menus, and key combos.
 * Call once per BrowserWindow.
 */
module.exports = function blockDevTools(win) {
  if (!win || !win.webContents) return;

  // 🔒 Immediately close DevTools if opened
  win.webContents.on('devtools-opened', () => {
    win.webContents.closeDevTools();
  });

  // ⌨️ Block shortcuts: Ctrl+Shift+I, Cmd+Opt+I, F12
  win.webContents.on('before-input-event', (event, input) => {
    const isCtrlShiftI =
      input.control && input.shift && input.key.toLowerCase() === 'i';
    const isCmdOptI =
      input.meta && input.alt && input.key.toLowerCase() === 'i';
    const isF12 = input.key.toLowerCase() === 'f12';

    if (isCtrlShiftI || isCmdOptI || isF12) {
      event.preventDefault();
    }
  });

  // 🖱️ Disable right-click context menu (optional)
  win.webContents.on('context-menu', e => e.preventDefault());
};
