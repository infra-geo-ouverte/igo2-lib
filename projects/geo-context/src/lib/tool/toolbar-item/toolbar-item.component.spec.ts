import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ToolbarItemComponent } from './toolbar-item.component';

describe('ToolbarItemComponent', () => {
  let component: ToolbarItemComponent;
  let fixture: ComponentFixture<ToolbarItemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [],
      declarations: [ToolbarItemComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ToolbarItemComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    component.tool = {
      title: 'foo',
      name: 'bar',
      icon: 'icon'
    };

    expect(component).toBeTruthy();
  });
});
