import { ComponentFixture, TestBed } from '@angular/core/testing';

import { mergeTestConfig } from '../../../../../test-config';
import { ContextPermissionItemComponent } from './context-permission-item.component';

describe('ContextPermissionItemComponent', () => {
  let component: ContextPermissionItemComponent;
  let fixture: ComponentFixture<ContextPermissionItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule(
      mergeTestConfig({
        imports: [ContextPermissionItemComponent]
      })
    ).compileComponents();

    fixture = TestBed.createComponent(ContextPermissionItemComponent);
    component = fixture.componentInstance;

    fixture.componentRef.setInput('permission', {});
    fixture.componentRef.setInput('canWrite', true);

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
