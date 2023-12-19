import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';

import { ExampleViewerComponent } from './example-viewer.component';

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
