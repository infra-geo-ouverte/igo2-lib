import { Component, input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

const SRC_PATH =
  'https://github.com/infra-geo-ouverte/igo2-lib/tree/master/projects/demo/src';

@Component({
  selector: 'app-example-viewer',
  templateUrl: './example-viewer.component.html',
  styleUrls: ['./example-viewer.component.scss'],
  imports: [
    MatCardModule,
    MatButtonModule,
    MatTooltipModule,
    MatIconModule,
    MatDividerModule
  ]
})
export class ExampleViewerComponent {
  readonly title = input<string>(undefined);
  readonly codeFolder = input<string>(undefined);
  readonly configFolder = input<string>(undefined);

  get codeUrl() {
    return `${SRC_PATH}/app/${this.codeFolder()}`;
  }

  get configUrl() {
    return `${SRC_PATH}/${this.configFolder()}`;
  }
}
