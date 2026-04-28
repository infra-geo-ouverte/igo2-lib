import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LayerUnavailableListComponent } from './layer-unavailable-list.component';

describe('LayerUnavailableListComponent', () => {
  let component: LayerUnavailableListComponent;
  let fixture: ComponentFixture<LayerUnavailableListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [LayerUnavailableListComponent]
    });
    fixture = TestBed.createComponent(LayerUnavailableListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
