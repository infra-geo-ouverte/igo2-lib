import { MessageService } from '@igo2/core';
import { ExportNothingToExportError } from './context-export.errors';

export function handleFileExportError(
  error: Error,
  messageService: MessageService
) {
  if (error instanceof ExportNothingToExportError) {
    this.handleNothingToExportError(messageService);
    return;
  }
  messageService.error(
    'igo.context.contextImportExport.export.failed.text',
    'igo.context.contextImportExport.export.failed.title'
  );
}

export function handleFileExportSuccess(messageService: MessageService) {
  messageService.success(
    'igo.context.contextImportExport.export.success.text',
    'igo.context.contextImportExport.export.success.title'
  );
}

export function handleNothingToExportError(messageService: MessageService) {
  messageService.error(
    'igo.context.contextImportExport.export.nothing.text',
    'igo.context.contextImportExport.export.nothing.title'
  );
}
