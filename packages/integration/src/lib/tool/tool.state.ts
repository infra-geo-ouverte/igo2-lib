import { Injectable } from '@angular/core';

import { Toolbox, ToolService } from '@igo2/common';

/**
 * Service that holds the state of the search module
 */
@Injectable({
  providedIn: 'root'
})
export class ToolState {
  get toolbox(): Toolbox {
    return this.toolService.toolbox;
  }

  constructor(private toolService: ToolService) {}
}
