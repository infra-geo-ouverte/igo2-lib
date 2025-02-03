// import { ComponentFixture, TestBed } from '@angular/core/testing';

// import { TEST_CONFIG } from '../../../test-config';
// import { IgoMap } from '../../map';
// import { IgoLayerModule } from '../layer.module';
// import { LayerController } from '../shared';
// import { LayerViewerBottomActionsComponent } from './layer-viewer-bottom-actions.component';

// describe('LayerViewerBottomActionsComponent', () => {
//   let component: LayerViewerBottomActionsComponent;
//   let fixture: ComponentFixture<LayerViewerBottomActionsComponent>;

//   beforeEach(() => {
//     TestBed.configureTestingModule({
//       ...TEST_CONFIG,
//       imports: [...TEST_CONFIG.imports, IgoLayerModule],
//       declarations: [LayerViewerBottomActionsComponent]
//     });
//     fixture = TestBed.createComponent(LayerViewerBottomActionsComponent);
//     component = fixture.componentInstance;

//     const map = new IgoMap();
//     component.map = map;
//     component.controller = new LayerController(map, []);
//     component.searchTerm = '';
//     fixture.detectChanges();
//   });

//   it('should create', () => {
//     expect(component).toBeTruthy();
//   });
// });
