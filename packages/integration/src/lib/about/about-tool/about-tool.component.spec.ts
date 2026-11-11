import { ComponentFixture, TestBed } from '@angular/core/testing';

import { provideConfig } from '@igo2/core/config';
import { provideMockTranslation } from '@igo2/core/language';

import { AboutToolComponent } from './about-tool.component';

describe('AboutToolComponent', () => {
  let component: AboutToolComponent;
  let fixture: ComponentFixture<AboutToolComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AboutToolComponent],
      providers: [
        provideMockTranslation(),
        provideConfig({
          default: {
            version: { app: '1.0.0' }
          }
        })
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AboutToolComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
