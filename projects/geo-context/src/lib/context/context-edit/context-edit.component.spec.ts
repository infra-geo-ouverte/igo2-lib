import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ContextEditComponent } from './context-edit.component';
import { ContextFormComponent } from '../context-form';

describe('ContextEditBaseComponent', () => {
  let component: ContextEditComponent;
  let fixture: ComponentFixture<ContextEditComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [],
      declarations: [ContextEditComponent, ContextFormComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContextEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
