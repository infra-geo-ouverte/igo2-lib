import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { APP_BASE_HREF } from '@angular/common';
import { RouterModule } from '@angular/router';

import { ContextItemComponent } from './context-item.component';

describe('ContextItemComponent', () => {
  let component: ContextItemComponent;
  let fixture: ComponentFixture<ContextItemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [RouterModule.forRoot([])],
      declarations: [ContextItemComponent],
      providers: [[{ provide: APP_BASE_HREF, useValue: '/' }]]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContextItemComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
