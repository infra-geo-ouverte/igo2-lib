import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { ToolComponent } from '@igo2/common';
import { RegionEditorComponent } from '../region-editor/region-editor.component';
import { RegionManagerComponent } from '../region-manager/region-manager.component';
// need to do the TODOs in tileDownloader beforehand
// need to make prototype of the interface
// need to create the all the methods

export enum Tab {
  Editor = 'Region Editor',
  Manager = 'Downloaded Regions'
}

@ToolComponent({
  name: 'download',
  title: 'igo.integration.tools.download',
  icon: 'download'
})
@Component({
  selector: 'igo-download-tool',
  templateUrl: './download-tool.component.html',
  styleUrls: ['./download-tool.component.scss']
})
export class DownloadToolComponent implements OnInit, AfterViewInit {
  @ViewChild('editor') regionEditor: RegionEditorComponent;
  @ViewChild('manager') regionManager: RegionManagerComponent;
  constructor() {}

  ngOnInit() {

  }

  ngAfterViewInit() {
    this.regionEditor.showEditedRegionFeatures();
  }

  onTabChange(event) {
    const tabTitle: string = event.tab.textLabel;
    switch (tabTitle) {
      case Tab.Editor:
        this.regionEditor.showEditedRegionFeatures();
        break;

      case Tab.Manager:
        this.regionManager.showSelectedRegionFeatures();
        break;

      default:
        break;
    }
  }
}
