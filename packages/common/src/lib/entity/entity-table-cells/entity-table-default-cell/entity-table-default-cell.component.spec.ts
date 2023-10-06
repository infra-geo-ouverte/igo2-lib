import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EntityTableDefaultCellComponent } from './entity-table-default-cell.component';
import { ENTIY_TABLE_COLUMN_MOCK } from '../../__mocks__/entity.mock';
import { CellData } from '../../shared';
import { Component } from '@angular/core';

describe('EntityTableDefaultCellComponent', () => {
  let component: EntityTableDefaultCellComponent;
  let fixture: ComponentFixture<TestWrapperComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EntityTableDefaultCellComponent]
    });
    fixture = TestBed.createComponent(TestWrapperComponent);
    component = fixture.debugElement.children[0].componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

@Component({
  selector: 'igo-test-wrapper-component',
  template: `<igo-entity-table-default-cell
    [cellData]="cellData"
  ></igo-entity-table-default-cell>`
})
class TestWrapperComponent {
  column = ENTIY_TABLE_COLUMN_MOCK;
  cellData: CellData = {
    [ENTIY_TABLE_COLUMN_MOCK.name]: {
      value: '',
      class: {}
    }
  };
}
