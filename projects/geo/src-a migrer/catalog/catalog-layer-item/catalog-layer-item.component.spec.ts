import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IgoTestModule } from '../../../test/module';
import { IgoSharedModule } from '../../shared';
import { CatalogLayerItemComponent } from './catalog-layer-item.component';

describe('CatalogLayerItemComponent', () => {
  let component: CatalogLayerItemComponent;
  let fixture: ComponentFixture<CatalogLayerItemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [IgoTestModule, IgoSharedModule],
      declarations: [CatalogLayerItemComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CatalogLayerItemComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
