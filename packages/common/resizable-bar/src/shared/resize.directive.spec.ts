import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { mergeTestConfig } from 'packages/common/test-config';

import { ResizeDirective } from './resize.directive';

// 1. Define a minimal host component
@Component({
  template: `<div igoResize>Host Element</div>`,
  imports: [ResizeDirective]
})
class TestHostComponent {}

describe('ResizeDirective', () => {
  let fixture: ComponentFixture<TestHostComponent>;

  // Set up the testing module
  beforeEach(async () => {
    await TestBed.configureTestingModule(
      mergeTestConfig({
        imports: [TestHostComponent]
      })
    ).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
  });

  it('should create an instance (by mounting it to an element)', () => {
    const element = fixture.debugElement.query(By.directive(ResizeDirective));

    expect(element).toBeTruthy();
    expect(element.injector.get(ResizeDirective)).toBeTruthy(); // Get the directive instance
  });
});
