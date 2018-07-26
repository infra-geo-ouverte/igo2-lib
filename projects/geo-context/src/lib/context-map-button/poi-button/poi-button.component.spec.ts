/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { APP_BASE_HREF } from '@angular/common';
import { RouterModule } from '@angular/router';

import { IgoLanguageModule } from '@igo2/core';
// import { IgoAuthModule } from '@igo2/auth';

import { PoiButtonComponent } from './poi-button.component';

describe('poiButtonComponent', () => {
  let component: PoiButtonComponent;
  let fixture: ComponentFixture<PoiButtonComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterModule.forRoot([]),
        IgoLanguageModule.forRoot()
        // IgoAuthModule.forRoot()
      ],
      declarations: [PoiButtonComponent],
      providers: [[{ provide: APP_BASE_HREF, useValue: '/' }]]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PoiButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
