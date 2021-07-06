import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { ToolComponent } from '@igo2/common';
import { RegionDBData } from '@igo2/core/public_api';
import { DownloadState } from '../download.state';
import { EditionStrategies } from '../region-editor/editing-strategy/edition-strategies';
import { RegionEditorComponent } from '../region-editor/region-editor.component';
import { RegionManagerComponent } from '../region-manager/region-manager.component';
import { DownloadToolState } from './download-tool.state';
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
  
  constructor(
    private state: DownloadToolState,
    private downloadState: DownloadState
  ) {
    this.downloadState.rightMouseClick$.subscribe((value) => {
      if (value) {
        this.selectedTabIndex = 0;
      }
    });
  }

  set selectedTabIndex(index: number) {
    this.state.selectedTabIndex = index;
  }

  get selectedTabIndex() {
    return this.state.selectedTabIndex;
  }

  ngOnInit() {
    const openedWithMouse = this.downloadState.openedWithMouse;
    if (openedWithMouse) {
      this.selectedTabIndex = 0;
    }
  }

  ngAfterViewInit() {
    this.downloadState.openedWithMouse = false;
    this.switchTab(this.selectedTabIndex);
    this.regionManager.regionToEdit$.subscribe((region: RegionDBData) => {
      this.selectedTabIndex = 0;
      this.regionEditor.updateRegion(region);
    });
  }

  onTabChange(event) {
    this.selectedTabIndex = event.index;
    this.switchTab(this.selectedTabIndex);
  }

  private switchTab(index: number) {
    switch (index) {
      case 0:
        this.regionEditor.showEditedRegionFeatures();
        break;
      case 1:
        this.regionManager.showSelectedRegionFeatures();
        break;
      default:
        break;
    }
  }
}
