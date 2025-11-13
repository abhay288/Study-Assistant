declare module "pdfjs-dist/legacy/build/pdf" {
  const pdfjs: any;
  export = pdfjs;
}

declare module "pdfjs-dist/build/pdf.worker.min.mjs" {
  const worker: any;
  export default worker;
}

declare module "tesseract.js" {
  const t: any;
  export default t;
}
