import { LanguageService } from '@igo2/core/language';

import { Observable } from 'rxjs';

export function translateError(
  prefix: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  error: any,
  languageService: LanguageService
): Observable<string> {
  return new Observable((observer) => {
    try {
      languageService.translate
        .get(prefix + error.error.message)
        .subscribe((errorMsg) => {
          observer.next(errorMsg);
          observer.complete();
        });
    } catch {
      if (error.error) observer.next(error.error.message);
      observer.complete();
    }
  });
}
