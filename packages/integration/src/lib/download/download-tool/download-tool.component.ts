import { Component, OnInit } from '@angular/core';
import { ToolComponent } from '@igo2/common';
import { TileDownloaderService } from '@igo2/geo'
import { ToolState } from '../../tool';

// need to do the TODOs in downloadService beforehand
// need to make prototype of the interface
// need to create the all the methods

@ToolComponent({
  name: 'download',
  title: 'igo.integration.tools.download',
  icon: 'share-variant' //testing purposes need to find good icon.
})
@Component({
  selector: 'igo-download-tool',
  templateUrl: './download-tool.component.html'
})
export class DownloadToolComponent implements OnInit {

  constructor(
    private downloadService: TileDownloaderService
  ) { }

  ngOnInit() {
    
  }

  public download() {

  }
}
