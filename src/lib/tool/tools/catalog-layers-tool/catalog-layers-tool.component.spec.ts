import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IgoSharedModule } from '../../../shared';
import { IgoFilterModule } from '../../../filter';
import { IgoMapModule } from '../../../map';

import { CatalogLayersToolComponent } from './catalog-layers-tool.component';

describe('CatalogLayersToolComponent', () => {
  let component: CatalogLayersToolComponent;
  let fixture: ComponentFixture<CatalogLayersToolComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        IgoSharedModule,
        IgoFilterModule.forRoot(),
        IgoMapModule.forRoot()
      ],
      declarations: [
        CatalogLayersToolComponent
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CatalogLayersToolComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
