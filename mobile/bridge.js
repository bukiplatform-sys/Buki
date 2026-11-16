import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';
if (Capacitor.isNativePlatform()) {
  window.BukiNative = { platform: Capacitor.getPlatform(), version: '1.0.0' };
  App.addListener('backButton', () => {
    // Exercise back buttons run their own save/cleanup handlers.
    const chat = document.querySelector('#worldChat header button');
    if (chat) { chat.click(); return; }
    const back = document.querySelector('#app .bar button');
    if (back) { back.click(); return; }
    App.minimizeApp();
  });
  App.addListener('appStateChange', ({ isActive }) => {
    if (isActive) window.dispatchEvent(new Event('online'));
    else window.dispatchEvent(new Event('pagehide'));
  });
}
