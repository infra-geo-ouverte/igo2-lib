import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LayerSearchComponent } from './layer-search.component';

describe('LayerSearchComponent', () => {
  let component: LayerSearchComponent;
  let fixture: ComponentFixture<LayerSearchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LayerSearchComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(LayerSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
