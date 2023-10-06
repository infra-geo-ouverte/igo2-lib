import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EntityTableDefaultCellComponent } from './entity-table-default-cell.component';

describe('EntityTableDefaultCellComponent', () => {
  let component: EntityTableDefaultCellComponent;
  let fixture: ComponentFixture<EntityTableDefaultCellComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EntityTableDefaultCellComponent]
    });
    fixture = TestBed.createComponent(EntityTableDefaultCellComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
