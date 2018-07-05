import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IgoTestModule } from '../../../test/module';
import { IgoSharedModule } from '../../shared';

import { CatalogLayersListComponent } from './catalog-layers-list.component';
import { CatalogLayerItemComponent } from '../catalog-layer-item';

describe('CatalogLayersListComponent', () => {
  let component: CatalogLayersListComponent;
  let fixture: ComponentFixture<CatalogLayersListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [IgoTestModule, IgoSharedModule],
      declarations: [CatalogLayersListComponent, CatalogLayerItemComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CatalogLayersListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
