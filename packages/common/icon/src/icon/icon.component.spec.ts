import { inputBinding } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { mergeTestConfig } from 'packages/common/test-config';

import { IgoIconComponent } from './icon.component';

describe('IconComponent', () => {
  let component: IgoIconComponent;
  let fixture: ComponentFixture<IgoIconComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule(
      mergeTestConfig({
        imports: [IgoIconComponent]
      })
    ).compileComponents();

    fixture = TestBed.createComponent(IgoIconComponent, {
      bindings: [inputBinding('icon', () => 'test')]
    });
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
