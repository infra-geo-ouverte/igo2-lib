import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';

import { ToolComponent } from '@igo2/common';
import { IgoMap } from '@igo2/geo';

import { MapState } from '../../map/map.state';
import { ImportExportState } from '../import-export.state';

@ToolComponent({
  name: 'importExport',
  title: 'igo.integration.tools.importExport',
  icon: 'file-move'
})
@Component({
  selector: 'igo-import-export-tool',
  templateUrl: './import-export-tool.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ImportExportToolComponent implements OnInit {
  /**
   * Map to measure on
   * @internal
   */
  get map(): IgoMap { return this.mapState.map; }

  constructor(
    private mapState: MapState,
    public importExportState: ImportExportState
  ) {}

  ngOnInit(): void {
    this.selectedTab();
  }

  private selectedTab() {
    const userSelectedTab = this.importExportState.selectedTab$.value;
    if (userSelectedTab !== undefined) {
      this.importExportState.setSelectedTab(userSelectedTab);
    } else {
      this.importExportState.setSelectedTab(0);

    }
  }

  public tabChanged(tab: number) {
    console.log('tab change integration', tab);
    this.importExportState.setSelectedTab(tab);
  }
}
