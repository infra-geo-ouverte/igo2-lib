import { MessageService, LanguageService } from '@igo2/core';
import { ExportNothingToExportError } from './context-export.errors';

export function handleFileExportError(
    error: Error,
    messageService: MessageService,
    languageService: LanguageService
  ) {
    if (error instanceof ExportNothingToExportError) {
      this.handleNothingToExportError(messageService, languageService);
      return;
    }
    const translate = languageService.translate;
    const title = translate.instant('igo.context.contextImportExport.export.failed.title');
    const message = translate.instant('igo.context.contextImportExport.export.failed.text');
    messageService.error(message, title);
}

export function handleFileExportSuccess(
    messageService: MessageService,
    languageService: LanguageService
  ) {
    const translate = languageService.translate;
    const title = translate.instant('igo.context.contextImportExport.export.success.title');
    const message = translate.instant('igo.context.contextImportExport.export.success.text');
    messageService.success(message, title);
}

export function handleNothingToExportError(
    messageService: MessageService,
    languageService: LanguageService
  ) {
    const translate = languageService.translate;
    const title = translate.instant('igo.context.contextImportExport.export.nothing.title');
    const message = translate.instant('igo.context.contextImportExport.export.nothing.text');
    messageService.error(message, title);
}
