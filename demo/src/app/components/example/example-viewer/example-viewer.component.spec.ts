import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExampleViewerComponent } from './example-viewer.component';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';

describe('ExampleViewerComponent', () => {
  let component: ExampleViewerComponent;
  let fixture: ComponentFixture<ExampleViewerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatCardModule, MatDividerModule],
      declarations: [ExampleViewerComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ExampleViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
