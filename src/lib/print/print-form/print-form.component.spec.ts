import { async, TestBed } from '@angular/core/testing';
// import { ComponentFixture } from '@angular/core/testing';

import { IgoSharedModule } from '../../shared';

import { PrintFormComponent } from './print-form.component';

describe('PrintFormComponent', () => {
  // let component: PrintFormComponent;
  // let fixture: ComponentFixture<PrintFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        IgoSharedModule,
      ],
      declarations: [ PrintFormComponent ]
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
