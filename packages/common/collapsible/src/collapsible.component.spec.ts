import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatIconModule } from '@angular/material/icon';
import { MatIconTestingModule } from '@angular/material/icon/testing';
import { MatListModule } from '@angular/material/list';

import { mergeTestConfig } from 'packages/common/test-config';

import { CollapseDirective } from './collapse.directive';
import { CollapsibleComponent } from './collapsible.component';

describe('CollapsibleComponent', () => {
  let component: CollapsibleComponent;
  let fixture: ComponentFixture<CollapsibleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule(
      mergeTestConfig({
        imports: [
          MatListModule,
          MatIconModule,
          MatIconTestingModule,
          CollapsibleComponent,
          CollapseDirective
        ]
      })
    ).compileComponents();

    fixture = TestBed.createComponent(CollapsibleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
