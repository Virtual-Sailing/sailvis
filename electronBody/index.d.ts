import { eAPI } from './preload';

declare global {
   interface Window {
      api: typeof eAPI,
      electron: ElectronAPI
   }
}