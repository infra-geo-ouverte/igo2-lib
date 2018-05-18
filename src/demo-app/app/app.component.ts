import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';

import { ContextService,
         Feature, FeatureType, FeatureService, IgoMap,
         LanguageService, LayerService, MapService, MessageService,
         OverlayService, ToolService, SourceFeatureType } from '../../lib';

import { AnyDataSourceContext, DataSourceService } from '../../lib/datasource';


@Component({
  selector: 'igo-demo',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.styl']
})
export class AppComponent implements OnInit {

  public map = new IgoMap({
    controls: {
      attribution: {
        collapsed: true
      }
    }
  });
  public searchTerm: string;
  public demoForm: FormGroup;

  get locationField () {
    return (<FormControl>this.demoForm.controls['location']);
  }

  constructor(public contextService: ContextService,
              public dataSourceService: DataSourceService,
              public featureService: FeatureService,
              public layerService: LayerService,
              public mapService: MapService,
              public messageService: MessageService,
              public overlayService: OverlayService,
              public toolService: ToolService,
              public language: LanguageService,
              private formBuilder: FormBuilder) {}

  ngOnInit() {
    // If you do not want to load a context from a file,
    // you can simply do contextService.setContext(context)
    // where "context" is an object with the same interface
    // as the contexts in ../contexts/
    this.demoForm = this.formBuilder.group({
      location: ['', [
        Validators.required
      ]]
    });
  }

  handleSearch(term: string) {
    this.searchTerm = term;
    const tool = this.toolService.getTool('searchResults');
    if (tool !== undefined) {
      this.toolService.selectTool(tool);
    }
  }

  handleFeatureFocus(feature: Feature) {
    if (feature.type === FeatureType.Feature) {
      this.overlayService.setFeatures([feature], 'move');
    }
  }

  handleFeatureSelect(feature: Feature) {
    if (feature.type === FeatureType.Feature) {
      this.overlayService.setFeatures([feature], 'zoom');
    } else if (feature.type === FeatureType.DataSource) {
      const map = this.mapService.getMap();

      if (map !== undefined) {
        this.dataSourceService
          .createAsyncDataSource(feature.layer as AnyDataSourceContext)
          .subscribe(dataSource =>  {
            map.addLayer(
              this.layerService.createLayer(dataSource, feature.layer));
          });
      }
    }
  }

  clearFeature() {
    this.featureService.unfocusFeature();
    this.overlayService.clear();
  }

  handleFormSubmit(data: any, isValid: boolean) {
    console.log(data);
    console.log(isValid);
  }

  handleQueryResults(results) {
    const features: Feature[] = results.features;
    if (features[0]) {
      this.featureService.updateFeatures(features, features[0].source);
      const firstClickFeature = features.filter(feature =>
        feature.sourceType === SourceFeatureType.Click)[0]
        this.featureService.features$.subscribe(f =>
          this.featureService.selectFeature(firstClickFeature))
    }
  }
}
