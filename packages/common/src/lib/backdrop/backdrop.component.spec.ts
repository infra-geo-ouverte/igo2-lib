import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { BackdropComponent } from './backdrop.component';

describe('BackdropComponent', () => {
  let component: BackdropComponent;
  let fixture: ComponentFixture<BackdropComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    imports: [BackdropComponent]
}).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BackdropComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
