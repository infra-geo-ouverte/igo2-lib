// import { TestBed, async, ComponentFixture } from '@angular/core/testing';
// // import { By } from '@angular/platform-browser';
// import { APP_BASE_HREF } from '@angular/common';
// import { RouterModule } from '@angular/router';
// import { MatSidenavModule, MatCardModule, MatIconModule } from '@angular/material';
//
// import { IgoTestModule } from '../../test/module';
// import { IgoModule, provideNominatimSearchSource } from '../../lib';
//
// import { AppComponent } from './app.component';
//
// describe('AppComponent', () => {
//
//   let component: AppComponent;
//   let fixture: ComponentFixture<AppComponent>;
//
//   beforeEach(async(() => {
//     TestBed.configureTestingModule({
//       imports: [
//         RouterModule.forRoot([]),
//         MatSidenavModule,
//         MatCardModule,
//         MatIconModule,
//         IgoModule.forRoot(),
//         IgoTestModule
//       ],
//       declarations: [
//         AppComponent
//       ],
//       providers: [
//         [{provide: APP_BASE_HREF, useValue: '/' }],
//         provideNominatimSearchSource()
//       ],
//     }).compileComponents();
//   }));
//
//   beforeEach(() => {
//     fixture = TestBed.createComponent(AppComponent);
//     component = fixture.componentInstance;
//   });
//
//   it('should create the app', async(() => {
//     expect(component).toBeTruthy();
//   }));
//
//   // it('should render title in a h1 tag', async(() => {
//   //   fixture.detectChanges();
//   //   fixture.whenStable().then(() => {
//   //     const test = fixture.debugElement.query(By.css('.mat-card-subtitle'));
//   //     expect(test).toContain('Context module');
//   //   });
//   // }));
// });
