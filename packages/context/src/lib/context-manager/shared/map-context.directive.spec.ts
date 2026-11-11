import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { MapBrowserComponent } from '@igo2/geo';

import { BehaviorSubject } from 'rxjs';
import { vi } from 'vitest';

import { MapContextDirective } from './map-context.directive';

function createMapMock() {
  return {
    status$: new BehaviorSubject('done'),
    setTarget: vi.fn(),
    updateView: vi.fn(),
    updateControls: vi.fn(),
    projection: 'EPSG:3857'
  } as any;
}

@Component({
  template: '<igo-map-browser [map]="map" igoMapContext></igo-map-browser>',
  standalone: true,
  imports: [MapBrowserComponent, MapContextDirective]
})
class HostComponent {
  readonly map = createMapMock();
}

describe('MapContextDirective', () => {
  let fixture: ComponentFixture<HostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HostComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(HostComponent);
  });

  it('should create the directive when used as template attribute', () => {
    fixture.detectChanges();

    const directiveEl = fixture.debugElement.query(
      By.directive(MapContextDirective)
    );
    const directive = directiveEl.injector.get(MapContextDirective);

    expect(directive).toBeTruthy();
  });

  it('should initialize and teardown without errors', () => {
    fixture.detectChanges();

    expect(() => fixture.destroy()).not.toThrow();
  });
});
