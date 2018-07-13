import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ContextListComponent } from './context-list.component';
import { ContextItemComponent } from '../context-item';

describe('ContextListBaseComponent', () => {
  let component: ContextListComponent;
  let fixture: ComponentFixture<ContextListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [],
      declarations: [ContextListComponent, ContextItemComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContextListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
