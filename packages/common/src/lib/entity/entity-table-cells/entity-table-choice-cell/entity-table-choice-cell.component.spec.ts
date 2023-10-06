import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EntityTableChoiceCellComponent } from './entity-table-choice-cell.component';

describe('EntityTableChoiceCellComponent', () => {
  let component: EntityTableChoiceCellComponent;
  let fixture: ComponentFixture<EntityTableChoiceCellComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EntityTableChoiceCellComponent]
    });
    fixture = TestBed.createComponent(EntityTableChoiceCellComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
