import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ContextToolsComponent } from './context-tools.component';

describe('ContextToolsBaseComponent', () => {
  let component: ContextToolsComponent;
  let fixture: ComponentFixture<ContextToolsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [],
      declarations: [ContextToolsComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContextToolsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
