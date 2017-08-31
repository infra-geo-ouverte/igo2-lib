import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IgoSharedModule } from '../../../shared';
import { IgoFilterModule } from '../../../filter';
import { IgoMapModule } from '../../../map';

import { CatalogToolComponent } from './catalog-tool.component';

describe('CatalogToolComponent', () => {
  let component: CatalogToolComponent;
  let fixture: ComponentFixture<CatalogToolComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        IgoSharedModule,
        IgoFilterModule.forRoot(),
        IgoMapModule.forRoot()
      ],
      declarations: [
        CatalogToolComponent
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CatalogToolComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
