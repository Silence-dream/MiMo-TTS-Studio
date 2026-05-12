import { contextBridge, ipcRenderer } from 'electron';
import type { DesktopSynthesizeRequest } from '../src/types/electron';

contextBridge.exposeInMainWorld('mimoDesktop', {
  platform: process.platform,
  synthesize: (request: DesktopSynthesizeRequest) =>
    ipcRenderer.invoke('mimo:tts:synthesize', request),
  cancel: (requestId: string) => ipcRenderer.invoke('mimo:tts:cancel', requestId),
});
