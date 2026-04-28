import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LayerItemComponent } from './layer-item.component';

describe('LayerItemComponent', () => {
  let component: LayerItemComponent;
  let fixture: ComponentFixture<LayerItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LayerItemComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(LayerItemComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
