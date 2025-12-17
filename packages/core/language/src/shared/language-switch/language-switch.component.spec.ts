import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LanguageSwitchComponent } from './language-switch.component';

describe('LanguageSwitchComponent', () => {
  let component: LanguageSwitchComponent;
  let fixture: ComponentFixture<LanguageSwitchComponent>;
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LanguageSwitchComponent]
    }).compileComponents();
    fixture = TestBed.createComponent(LanguageSwitchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });
  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
