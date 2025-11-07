import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { mergeTestConfig } from 'packages/auth/test-config';

import { CollapseDirective } from './collapse.directive';

@Component({
  imports: [CollapseDirective],
  template: `<div igoCollapse></div>`
})
class TestHostComponent {}

describe('CollapseDirective', () => {
  let fixture: ComponentFixture<TestHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule(
      mergeTestConfig({
        imports: [TestHostComponent]
      })
    ).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
  });

  it('should create an instance', () => {
    const directiveEl = fixture.debugElement.query(
      By.directive(CollapseDirective)
    );
    expect(directiveEl).not.toBeNull();
  });
});
