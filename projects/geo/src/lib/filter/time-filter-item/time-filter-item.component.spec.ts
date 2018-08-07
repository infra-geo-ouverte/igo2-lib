// import {
//   async,
//   ComponentFixture,
//   TestBed,
//   inject
// } from '@angular/core/testing';
// import { MatDatepickerModule, MatNativeDateModule } from '@angular/material';
// import {
//   MatDatetimepickerModule,
//   MatNativeDatetimeModule
// } from '@mat-datetimepicker/core';
//
// import { WMSDataSource, WFSDataSourceService } from '../../datasource';
//
// import { TimeFilterItemComponent } from './time-filter-item.component';
// import { TimeFilterFormComponent } from '../time-filter-form';
//
// describe('TimeFilterItemComponent', () => {
//   let component: TimeFilterItemComponent;
//   let fixture: ComponentFixture<TimeFilterItemComponent>;
//
//   beforeEach(async(() => {
//     TestBed.configureTestingModule({
//       imports: [
//         MatDatepickerModule,
//         MatNativeDateModule,
//         MatDatetimepickerModule,
//         MatNativeDatetimeModule
//       ],
//       declarations: [TimeFilterItemComponent, TimeFilterFormComponent],
//       providers: [WFSDataSourceService]
//     }).compileComponents();
//   }));
//
//   beforeEach(() => {
//     fixture = TestBed.createComponent(TimeFilterItemComponent);
//     component = fixture.componentInstance;
//   });
//
//   it('should create', inject(
//     [WFSDataSourceService],
//     (service: WFSDataSourceService) => {
//       const dataSource = new WMSDataSource(
//         {
//           title: 'WMS',
//           url: 'foo',
//           projection: 'EPSG:3857',
//           params: {
//             layers: 'bar'
//           }
//           timeFilter: {}
//         },
//         service
//       );
//       component.datasource = dataSource;
//       expect(component).toBeTruthy();
//     }
//   ));
// });
