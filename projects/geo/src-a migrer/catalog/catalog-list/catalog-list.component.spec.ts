import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IgoTestModule } from '../../../test/module';
import { IgoSharedModule } from '../../shared';

import { CatalogListComponent } from './catalog-list.component';
import { CatalogItemComponent } from '../catalog-item';

describe('CatalogListBaseComponent', () => {
  let component: CatalogListComponent;
  let fixture: ComponentFixture<CatalogListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [IgoTestModule, IgoSharedModule],
      declarations: [CatalogListComponent, CatalogItemComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CatalogListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
