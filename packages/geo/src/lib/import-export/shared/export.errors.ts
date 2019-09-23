export class ExportError extends Error {}

export class ExportInvalidFileError extends ExportError {
  constructor() {
    super('Invalid file');
    Object.setPrototypeOf(this, ExportInvalidFileError.prototype);
  }
}

export class ExportNothingToExportError extends ExportError {
  constructor() {
    super('Nothing to export');
    Object.setPrototypeOf(this, ExportNothingToExportError.prototype);
  }
}
