import { HttpClient } from '@angular/common/http';
import {
  ChangeDetectorRef,
  Component,
  OnInit,
  inject,
  input,
  model
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';

import { AuthService, UserService } from '@igo2/auth';
import { CustomHtmlComponent } from '@igo2/common/custom-html';
import { ToolComponent } from '@igo2/common/tool';
import { ConfigService, version } from '@igo2/core/config';
import { IgoLanguageModule } from '@igo2/core/language';

import { AllEnvironmentOptions } from '../../environment';

@ToolComponent({
  name: 'about',
  title: 'igo.integration.tools.about',
  icon: 'help'
})
@Component({
  selector: 'igo-about-tool',
  templateUrl: './about-tool.component.html',
  styleUrls: ['./about-tool.component.scss'],
  imports: [
    MatButtonModule,
    MatTooltipModule,
    MatIconModule,
    MatMenuModule,
    CustomHtmlComponent,
    IgoLanguageModule
  ]
})
export class AboutToolComponent implements OnInit {
  configService = inject(ConfigService);
  auth = inject(AuthService);
  private http = inject(HttpClient);
  private cdRef = inject(ChangeDetectorRef);
  private userService = inject(UserService, {
    optional: true
  });

  private configOptions: AllEnvironmentOptions;

  readonly headerHtml = input<string, string | string[]>('', {
    transform: (value) => (Array.isArray(value) ? value.join('\n') : value)
  });

  readonly html = input<string, string | string[]>(
    'igo.integration.aboutTool.html',
    { transform: (value) => (Array.isArray(value) ? value.join('\n') : value) }
  );

  readonly trainingGuideURLs = model<string[]>();

  public effectiveVersion?: string;

  private baseUrlGuide?: string;

  public loading = false;

  constructor() {
    this.configOptions = this.configService.getConfigs();
    const configVersion = this.configOptions.version;
    this.effectiveVersion = configVersion?.app ?? version.app;
    const depot = this.configOptions.depot;
    if (depot) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      this.baseUrlGuide = depot.url + (depot as any).guideUrl;
    }
  }

  ngOnInit(): void {
    if (this.auth.authenticated) {
      if (this.configOptions.context?.url) {
        this.userService?.getUser().subscribe((user) => {
          this.trainingGuideURLs.set(user['guides']);
        });
      } else {
        const trainingGuides = this.configOptions.depot?.trainingGuides;
        if (trainingGuides) {
          this.trainingGuideURLs.set(trainingGuides);
        }
      }
    }
  }

  openGuide(guide?: string) {
    const url = guide
      ? this.baseUrlGuide + guide
      : this.baseUrlGuide + (this.trainingGuideURLs()?.[0] ?? '');

    this.loading = true;
    this.http
      .get(url, {
        responseType: 'blob'
      })
      .subscribe({
        next: (blob) => {
          this.loading = false;

          const blobUrl = URL.createObjectURL(blob);
          window.open(blobUrl, '_blank');
          // To avoid memory leak we need to revoke the object, 60 seconds to handle larger object like video
          setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);

          this.cdRef.markForCheck();
        },
        error: () => (this.loading = false)
      });
  }

  formatFileName(name: string) {
    name = name.split('_').join(' ');
    const index = name.indexOf('.');
    name = name.slice(0, index);
    return name;
  }
}
