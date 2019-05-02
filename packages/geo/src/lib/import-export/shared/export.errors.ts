export class ExportError extends Error {}

export class ExportInvalidFileError extends ExportError {
  constructor() {
    super('Invalid file.');
    Object.setPrototypeOf(this, ExportInvalidFileError.prototype);
  }
}
