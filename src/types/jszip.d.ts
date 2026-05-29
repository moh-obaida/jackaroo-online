declare module 'jszip' {
  export default class JSZip {
    file(name: string, data: string | Blob | ArrayBuffer): JSZip;
    generateAsync(options: { type: 'blob' }): Promise<Blob>;
    generateAsync(options?: { type?: 'base64' | 'uint8array' }): Promise<string | Uint8Array>;
  }
}
