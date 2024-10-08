import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { IgoCustomHtmlModule } from '@igo2/common/custom-html';
import { IgoLanguageModule } from '@igo2/core/language';

import { AboutToolComponent } from './about-tool.component';

describe('AboutToolComponent', () => {
  let component: AboutToolComponent;
  let fixture: ComponentFixture<AboutToolComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [IgoLanguageModule, IgoCustomHtmlModule],
      declarations: [AboutToolComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AboutToolComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
