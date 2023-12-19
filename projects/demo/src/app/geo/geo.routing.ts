import { Routes } from '@angular/router';

import { AppCatalogComponent } from './catalog/catalog.component';
import { AppDirectionsComponent } from './directions/directions.component';
import { AppFeatureComponent } from './feature/feature.component';
import { AppGeometryComponent } from './geometry/geometry.component';
import { AppHoverComponent } from './hover/hover.component';
import { AppImportExportComponent } from './import-export/import-export.component';
import { AppLayerComponent } from './layer/layer.component';
import { AppLegendComponent } from './legend/legend.component';
import { AppMeasureComponent } from './measure/measure.component';
import { AppOgcFilterComponent } from './ogc-filter/ogc-filter.component';
import { AppOverlayComponent } from './overlay/overlay.component';
import { AppPrintComponent } from './print/print.component';
import { AppQueryComponent } from './query/query.component';
import { AppSearchComponent } from './search/search.component';
import { AppSimpleMapComponent } from './simple-map/simple-map.component';
import { AppSpatialFilterComponent } from './spatial-filter/spatial-filter.component';
import { AppTimeFilterComponent } from './time-filter/time-filter.component';
import { AppWorkspaceComponent } from './workspace/workspace.component';

export const routes: Routes = [
  { path: '', redirectTo: 'activity', pathMatch: 'full' },
  {
    title: 'Simple map',
    path: 'simple-map',
    component: AppSimpleMapComponent
  },
  {
    title: 'Layer',
    path: 'layer',
    component: AppLayerComponent
  },
  {
    title: 'Legend',
    path: 'legend',
    component: AppLegendComponent
  },
  {
    title: 'Overlay',
    path: 'overlay',
    component: AppOverlayComponent
  },
  {
    title: 'Geometry',
    path: 'geometry',
    component: AppGeometryComponent
  },
  {
    title: 'Feature',
    path: 'feature',
    component: AppFeatureComponent
  },
  {
    title: 'Hover',
    path: 'hover',
    component: AppHoverComponent
  },
  {
    title: 'Measure',
    path: 'measure',
    component: AppMeasureComponent
  },
  {
    title: 'Draw',
    path: 'draw',
    loadChildren: () =>
      import('./draw/draw.module').then((m) => m.AppDrawModule)
  },
  {
    title: 'Query',
    path: 'query',
    component: AppQueryComponent
  },
  {
    title: 'Catalog',
    path: 'catalog',
    component: AppCatalogComponent
  },
  {
    title: 'Search',
    path: 'search',
    component: AppSearchComponent
  },
  {
    title: 'Print',
    path: 'print',
    component: AppPrintComponent
  },
  {
    title: 'Import/Export',
    path: 'import-export',
    component: AppImportExportComponent
  },
  {
    title: 'Directions',
    path: 'directions',
    component: AppDirectionsComponent
  },
  {
    title: 'Time Filter',
    path: 'time-filter',
    component: AppTimeFilterComponent
  },
  {
    title: 'OGC Filter',
    path: 'ogc-filter',
    component: AppOgcFilterComponent
  },
  {
    title: 'Spatial Filter',
    path: 'spatial-filter',
    component: AppSpatialFilterComponent
  },
  {
    title: 'Workspace',
    path: 'workspace',
    component: AppWorkspaceComponent
  }
];
