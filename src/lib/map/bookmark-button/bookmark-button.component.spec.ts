/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { APP_BASE_HREF } from '@angular/common';
import { RouterModule } from '@angular/router';

import { IgoCoreModule } from '../../core';
import { IgoSharedModule } from '../../shared';
import { IgoAuthModule } from '../../auth';
import { IgoContextModule } from '../../context';
import { IgoToolModule } from '../../tool';

import { BookmarkButtonComponent } from './bookmark-button.component';

describe('bookmarkButtonComponent', () => {
  let component: BookmarkButtonComponent;
  let fixture: ComponentFixture<BookmarkButtonComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterModule.forRoot([]),
        IgoCoreModule.forRoot(),
        IgoSharedModule,
        IgoAuthModule.forRoot(),
        IgoContextModule.forRoot(),
        IgoToolModule.forRoot()
      ],
      declarations: [],
      providers: [
        [{provide: APP_BASE_HREF, useValue : '/' }]
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BookmarkButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
