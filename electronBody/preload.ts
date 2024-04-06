import { contextBridge, ipcRenderer } from 'electron';

export const eAPI = {
  getFileData: () => ipcRenderer.invoke("getFileData"),
  getFileName: () => ipcRenderer.invoke("getFileName"),
}

window.addEventListener("DOMContentLoaded", () => {
    const replaceText = (selector: string, text: string) => {
      const element = document.getElementById(selector);
      if (element) { element.innerText = text; }
    };
  
    for (const type of ["chrome", "node", "electron"]) {
      replaceText(`${type}-version`, (process.versions[type]) as string);
    }
});

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('api', eAPI)
  } catch (error) {
    console.error(error)
  }
} else {
  window.api = eAPI;
}