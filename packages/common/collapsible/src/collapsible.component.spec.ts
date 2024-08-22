import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MatIconModule } from '@angular/material/icon';
import { MatIconTestingModule } from '@angular/material/icon/testing';
import { MatListModule } from '@angular/material/list';

import { CollapseDirective } from './collapse.directive';
import { CollapsibleComponent } from './collapsible.component';

describe('CollapsibleComponent', () => {
  let component: CollapsibleComponent;
  let fixture: ComponentFixture<CollapsibleComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        MatListModule,
        MatIconModule,
        MatIconTestingModule,
        CollapsibleComponent,
        CollapseDirective
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CollapsibleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
