import { ComponentFixture, TestBed } from '@angular/core/testing';

import { mergeTestConfig } from 'projects/demo/src/test-config';

import { ExampleSeeCodeComponent } from './example-see-code.component';

describe('ExampleSeeCodeComponent', () => {
  let component: ExampleSeeCodeComponent;
  let fixture: ComponentFixture<ExampleSeeCodeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule(
      mergeTestConfig({
        imports: [ExampleSeeCodeComponent]
      })
    ).compileComponents();

    fixture = TestBed.createComponent(ExampleSeeCodeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
