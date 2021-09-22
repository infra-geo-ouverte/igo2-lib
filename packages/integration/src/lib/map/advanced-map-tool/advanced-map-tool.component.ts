import { Component, OnInit } from '@angular/core';
import { ToolComponent } from '@igo2/common';

@ToolComponent({
  name: 'advancedMap',
  title: 'igo.integration.tools.advancedMap',
  icon: 'toolbox'
})

/**
 * Tool to handle the advanced map tools
 */
@Component({
  selector: 'igo-advanced-map-tool',
  templateUrl: './advanced-map-tool.component.html',
  styleUrls: ['./advanced-map-tool.component.scss']
})

export class AdvancedMapToolComponent implements OnInit {

  ngOnInit(): void{}
}
