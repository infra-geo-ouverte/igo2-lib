import { async, TestBed } from '@angular/core/testing';
// import { ComponentFixture } from '@angular/core/testing';

import { IgoSharedModule } from '../../shared';

import { RoutingFormComponent } from './routing-form.component';
import { RoutingService, provideRoutingSourceService } from '../shared';
import { RoutingSource } from '../routing-sources';

describe('RoutingFormComponent', () => {
  // let component: PrintFormComponent;
  // let fixture: ComponentFixture<PrintFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        IgoSharedModule,
      ],
      declarations: [ RoutingFormComponent ],
      providers: [
        RoutingService,
        RoutingSource,
        provideRoutingSourceService()
      ]
    })
    .compileComponents();
  }));

  /*
  beforeEach(() => {
    fixture = TestBed.createComponent(PrintFormComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  */
});
