import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { mergeTestConfig } from 'packages/common/test-config';

import { ListItemDirective } from './list-item.directive';

@Component({
  imports: [ListItemDirective],
  template: `<div igoListItem></div>`
})
class TestHostComponent {}

describe('ListItemDirective', () => {
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
      By.directive(ListItemDirective)
    );
    expect(directiveEl).toBeTruthy();
  });
});
