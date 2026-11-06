import { ComponentFixture, TestBed } from '@angular/core/testing';

import { beforeEach, describe, expect, it } from 'vitest';

import { OgcFilterConfig } from '../../model';
import { OgcFilterStore } from '../../state/ogc-filter.store';
import { OgcFilterPanelComponent } from './ogc-filter-panel.component';

const ADVANCED_CONFIG: OgcFilterConfig = {
  enabled: true,
  editable: true,
  geometryName: 'geometry',
  filters: {
    operator: 'PropertyIsEqualTo',
    propertyName: 'num_route',
    expression: '00020'
  },
  fields: [{ name: 'num_route', type: 'string' }]
};

const SELECTOR_CONFIG: OgcFilterConfig = {
  enabled: true,
  editable: false,
  geometryName: 'geometry',
  selectors: [
    {
      id: 'routes',
      presentation: 'checkbox',
      multiple: true,
      items: [
        {
          title: 'Route 20',
          enabled: true,
          filters: {
            operator: 'PropertyIsEqualTo',
            propertyName: 'num_route',
            expression: '00020'
          }
        }
      ]
    }
  ]
};

describe('OgcFilterPanelComponent', () => {
  let fixture: ComponentFixture<OgcFilterPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OgcFilterPanelComponent]
    }).compileComponents();
    fixture = TestBed.createComponent(OgcFilterPanelComponent);
  });

  it('renders one rule editor per rule in advanced mode', () => {
    fixture.componentRef.setInput('store', new OgcFilterStore(ADVANCED_CONFIG));
    fixture.detectChanges();

    const element: HTMLElement = fixture.nativeElement;
    expect(element.querySelectorAll('igo-ogc-filter-rule')).toHaveLength(1);
    expect(element.querySelector('igo-ogc-filter-selector')).toBeNull();
  });

  it('adds a rule through the store', () => {
    const store = new OgcFilterStore(ADVANCED_CONFIG);
    fixture.componentRef.setInput('store', store);
    fixture.detectChanges();

    store.addRule();
    fixture.detectChanges();

    expect(
      (fixture.nativeElement as HTMLElement).querySelectorAll(
        'igo-ogc-filter-rule'
      )
    ).toHaveLength(2);
  });

  it('renders the selector presentation in selector mode', () => {
    fixture.componentRef.setInput('store', new OgcFilterStore(SELECTOR_CONFIG));
    fixture.detectChanges();

    const element: HTMLElement = fixture.nativeElement;
    expect(element.querySelector('igo-ogc-filter-selector')).not.toBeNull();
    expect(element.querySelectorAll('mat-checkbox')).toHaveLength(1);
  });
});
