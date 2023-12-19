import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExampleSeeCodeComponent } from './example-see-code.component';

describe('ExampleSeeCodeComponent', () => {
  let component: ExampleSeeCodeComponent;
  let fixture: ComponentFixture<ExampleSeeCodeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ExampleSeeCodeComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ExampleSeeCodeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
