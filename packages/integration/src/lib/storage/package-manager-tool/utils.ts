import { LanguageService } from '@igo2/core/language';

export const dynamicFormatSize = (
  size: number,
  languageService: LanguageService
): string => {
  const formated = size / (1000 * 1000 * 1000);
  return formated < 1
    ? `${(formated * 1000).toFixed(2)} ${languageService.translate.instant('igo.integration.package-manager.mb')}`
    : `${formated.toFixed(2)} ${languageService.translate.instant('igo.integration.package-manager.gb')}`;
};
