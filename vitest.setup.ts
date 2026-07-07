import '@testing-library/jest-dom/vitest'

// jsdom does not implement Blob/File.arrayBuffer(), which DropZone and the page
// integration test use to read dropped PDFs. Polyfill it via FileReader (which
// jsdom does implement) so component tests exercise the real code path.
if (typeof Blob !== 'undefined' && !Blob.prototype.arrayBuffer) {
  ;(Blob.prototype as { arrayBuffer?: () => Promise<ArrayBuffer> }).arrayBuffer = function arrayBuffer(): Promise<ArrayBuffer> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as ArrayBuffer)
      reader.onerror = () => reject(reader.error)
      reader.readAsArrayBuffer(this as Blob)
    })
  }
}
