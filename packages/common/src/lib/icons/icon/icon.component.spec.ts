import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IgoIconComponent } from './icon.component';

describe('IconComponent', () => {
  let component: IgoIconComponent;
  let fixture: ComponentFixture<IgoIconComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IgoIconComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(IgoIconComponent);
    component = fixture.componentInstance;
    component.icon = 'test';
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
