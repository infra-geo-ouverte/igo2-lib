import { Injectable } from '@angular/core';

import { Toolbox, ToolService } from '@igo2/common';

/**
 * Service that holds the state of the search module
 */
@Injectable({
  providedIn: 'root'
})
export class ToolState {
  /**
   * Toolbox that holds main tools
   */
  toolbox: Toolbox = new Toolbox();

  constructor(private toolService: ToolService) {
    this.toolbox.setTools(this.toolService.getTools());
  }
}
