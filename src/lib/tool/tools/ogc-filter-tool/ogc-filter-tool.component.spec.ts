import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IgoSharedModule } from '../../../shared';
import { IgoFilterModule } from '../../../filter';
import { IgoMapModule } from '../../../map';

import { OgcFilterToolComponent } from './ogc-filter-tool.component';

describe('TimeAnalysisToolComponent', () => {
  let component: OgcFilterToolComponent;
  let fixture: ComponentFixture<OgcFilterToolComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        IgoSharedModule,
        IgoFilterModule.forRoot(),
        IgoMapModule.forRoot()
      ],
      declarations: [
        OgcFilterToolComponent
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OgcFilterToolComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
