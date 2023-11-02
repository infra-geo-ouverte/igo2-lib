import { Component, Input } from '@angular/core';

const SRC_PATH =
  'https://github.com/infra-geo-ouverte/igo2-lib/tree/master/projects/demo/src';

@Component({
  selector: 'app-example-viewer',
  templateUrl: './example-viewer.component.html',
  styleUrls: ['./example-viewer.component.scss']
})
export class ExampleViewerComponent {
  @Input() title: string;
  @Input() codeFolder: string;
  @Input() configFolder: string;

  get codeUrl() {
    return `${SRC_PATH}/app/${this.codeFolder}`;
  }

  get configUrl() {
    return `${SRC_PATH}/${this.configFolder}`;
  }
}
