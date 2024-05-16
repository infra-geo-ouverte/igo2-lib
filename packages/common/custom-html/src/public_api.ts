import { CustomHtmlComponent } from './custom-html.component';
import { SanitizeHtmlPipe } from './custom-html.pipe';

export * from './custom-html.module';
export * from './custom-html.component';
export * from './custom-html.pipe';

export const CUSTOM_HTML_DIRECTIVES = [
  SanitizeHtmlPipe,
  CustomHtmlComponent
] as const;
