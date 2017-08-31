import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MdListModule, MdIconModule } from '@angular/material';

import { CollapsibleComponent } from './collapsible.component';
import { CollapseDirective } from './collapse.directive';

describe('CollapsibleComponent', () => {
  let component: CollapsibleComponent;
  let fixture: ComponentFixture<CollapsibleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        MdListModule,
        MdIconModule
      ],
      declarations: [
        CollapsibleComponent,
        CollapseDirective
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CollapsibleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
