import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EntityTableAutocompleteFieldComponent } from './entity-table-autocomplete-field.component';

describe('EntityTableAutocompleteFieldComponent', () => {
  let component: EntityTableAutocompleteFieldComponent;
  let fixture: ComponentFixture<EntityTableAutocompleteFieldComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EntityTableAutocompleteFieldComponent]
    });
    fixture = TestBed.createComponent(EntityTableAutocompleteFieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
