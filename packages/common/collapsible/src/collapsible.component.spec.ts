import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CollapsibleComponent } from './collapsible.component';

describe('CollapsibleComponent', () => {
  let component: CollapsibleComponent;
  let fixture: ComponentFixture<CollapsibleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CollapsibleComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(CollapsibleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
