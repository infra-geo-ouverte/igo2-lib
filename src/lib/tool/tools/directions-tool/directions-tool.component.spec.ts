import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IgoSharedModule } from '../../../shared';
import { IgoRoutingModule ,
  RoutingSource, provideRoutingSourceService, RoutingService} from '../../../routing';
import { IgoMapModule } from '../../../map';


import { DirectionsToolComponent } from './directions-tool.component';

describe('DirectionsToolComponent', () => {
  let component: DirectionsToolComponent;
  let fixture: ComponentFixture<DirectionsToolComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        IgoSharedModule,
        IgoRoutingModule.forRoot(),
        IgoMapModule.forRoot()
      ],
      providers: [
        RoutingSource,
        RoutingService,
        provideRoutingSourceService(),
      ],
      declarations: [
        DirectionsToolComponent
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DirectionsToolComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
