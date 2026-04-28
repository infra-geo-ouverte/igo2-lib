import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { SidenavShimDirective } from './sidenav-shim.directive';

@Component({
  imports: [SidenavShimDirective],
  template: `<div igoSidenavShim></div>`
})
class TestHostComponent {}

describe('SidenavShimDirective', () => {
  let fixture: ComponentFixture<TestHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
  });

  it('should create an instance', () => {
    const directiveEl = fixture.debugElement.query(
      By.directive(SidenavShimDirective)
    );
    expect(directiveEl).toBeTruthy();
  });
});
