import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { BehaviorSubject } from 'rxjs';
import { vi } from 'vitest';

import { MapService } from '../../map/shared/map.service';
import { OgcFilterableListBindingDirective } from './ogc-filterable-list-binding.directive';
import { OgcFilterableListComponent } from './ogc-filterable-list.component';

const MOCKED_MAP = {
  getMap: vi.fn(() => ({
    layerController: {
      layersFlattened$: new BehaviorSubject<any[]>([])
    }
  }))
};

@Component({
  template: '<igo-ogc-filterable-list igoOgcFilterableListBinding />',
  standalone: true,
  imports: [OgcFilterableListComponent, OgcFilterableListBindingDirective]
})
class HostComponent {}

describe('OgcFilterableListBindingDirective', () => {
  let fixture: ComponentFixture<HostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HostComponent],
      providers: [
        {
          provide: MapService,
          useValue: MOCKED_MAP
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(HostComponent);
  });

  it('should create the directive when used as template attribute', () => {
    fixture.detectChanges();

    const directiveEl = fixture.debugElement.query(
      By.directive(OgcFilterableListBindingDirective)
    );
    const directive = directiveEl.injector.get(
      OgcFilterableListBindingDirective
    );

    expect(directive).toBeTruthy();
  });

  it('should initialize and teardown without errors', () => {
    fixture.detectChanges();

    expect(() => fixture.destroy()).not.toThrow();
  });
});
