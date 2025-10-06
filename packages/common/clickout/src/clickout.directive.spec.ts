import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { mergeTestConfig } from 'packages/common/test-config';

import { ClickoutDirective } from './clickout.directive';

@Component({
  imports: [ClickoutDirective],
  template: `<div igoClickout></div>`
})
class TestHostComponent {}

describe('ClickoutDirective', () => {
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
      By.directive(ClickoutDirective)
    );
    expect(directiveEl).toBeTruthy();
  });
});
