import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IgoTestModule } from '../../../../test/module';
import { IgoSharedModule } from '../../../shared';
import { IgoPrintModule } from '../../../print';
import { IgoMapModule } from '../../../map';
import { MessageService, ActivityService } from '../../../core';

import { PrintToolComponent } from './print-tool.component';

describe('PrintToolComponent', () => {
  let component: PrintToolComponent;
  let fixture: ComponentFixture<PrintToolComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        IgoTestModule,
        IgoSharedModule,
        IgoPrintModule.forRoot(),
        IgoMapModule.forRoot()
      ],
      declarations: [
        PrintToolComponent
      ],
      providers: [
        MessageService,
        ActivityService
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PrintToolComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
