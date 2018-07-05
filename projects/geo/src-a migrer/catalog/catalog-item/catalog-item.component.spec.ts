import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IgoSharedModule } from '../../shared';

import { CatalogItemComponent } from './catalog-item.component';

describe('CatalogItemComponent', () => {
  let component: CatalogItemComponent;
  let fixture: ComponentFixture<CatalogItemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [IgoSharedModule],
      declarations: [CatalogItemComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CatalogItemComponent);
    component = fixture.componentInstance;
  });

  it('should create', async () => {
    expect(component).toBeTruthy();
  });
});
