import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IgoTestModule } from '../../../test/module';
import { IgoSharedModule } from '../../shared';

import { TableComponent } from './table.component';


describe('TableComponent', () => {
  let component: TableComponent;
  let fixture: ComponentFixture<TableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        IgoTestModule,
        IgoSharedModule
      ],
      declarations: [
        TableComponent
      ],
      providers: []
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
