import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { Register } from '@igo2/context';

import { AboutToolOptions } from './about-tool.interface';

@Register({
  name: 'about',
  title: 'igo.tools.about',
  icon: 'help'
})
@Component({
  selector: 'igo-about-tool',
  templateUrl: './about-tool.component.html'
})
export class AboutToolComponent {
  public options: AboutToolOptions = {};
  private defaultAboutText = `
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

  get html(): string {
    return this.options.html === undefined
      ? this.defaultAboutText
      : this.options.html;
  }

  constructor() {}
}
