import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CatalogLayerItemComponent } from './catalog-layer-item.component';

describe('CatalogLayerItemComponent', () => {
  let component: CatalogLayerItemComponent;
  let fixture: ComponentFixture<CatalogLayerItemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [],
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
