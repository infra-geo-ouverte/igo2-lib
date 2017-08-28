/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IgoSharedModule } from '../../shared';

import { BookmarkButtonComponent } from './bookmark-button.component';

describe('bookmarkButtonComponent', () => {
  let component: BookmarkButtonComponent;
  let fixture: ComponentFixture<BookmarkButtonComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        IgoSharedModule
      ],
      declarations: [ BookmarkButtonComponent ]
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
