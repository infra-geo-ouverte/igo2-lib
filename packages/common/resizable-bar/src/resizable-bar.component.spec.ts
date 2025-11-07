import { ComponentFixture, TestBed } from '@angular/core/testing';

import { mergeTestConfig } from 'packages/common/test-config';

import { ResizableBarComponent } from './resizable-bar.component';

describe('ResizableBarComponent', () => {
  let component: ResizableBarComponent;
  let fixture: ComponentFixture<ResizableBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule(
      mergeTestConfig({
        declarations: [],
        imports: [ResizableBarComponent]
      })
    ).compileComponents();

    fixture = TestBed.createComponent(ResizableBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
