import { Component, Input } from '@angular/core';

import { ToolComponent } from '@igo2/common';

@ToolComponent({
  name: 'about',
  title: 'igo.integration.tools.about',
  icon: 'help'
})
@Component({
  selector: 'igo-about-tool',
  templateUrl: './about-tool.component.html'
})
export class AboutToolComponent {
  @Input() html: string = `
    <h1>About IGO</h1>
    <p>IGO (for Open GIS Infrastructure) is a Free Open Source Software
    for Geospatial (FOSS4G) developed by organisations in the government
    of Quebec in Canada. The objective is to make it open, common,
    modular, based on open governance model supported by multiple
    organisations. IGO is a Web GIS software with a client & server
    component to manage and publish massive amount of Geospatial data.
    </p>
    </hr>
    <a href='mailto:info@igouverte.org' target='_top'>info[@]igouverte.org</a>
    </br>
    <a href='http://www.igouverte.org' target='_blank'>www.igouverte.org</A>`;

  constructor() {}
}
