import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { SubjectStatus } from '@igo2/utils';

import OlObservable from 'ol/Observable';

import { BehaviorSubject } from 'rxjs';
import { vi } from 'vitest';

import { LayerController } from '../../layer';
import { IgoMap } from '../../map';
import { MapBrowserComponent } from '../../map/map-browser/map-browser.component';
import { QueryDirective } from './query.directive';

function createMapMock(): IgoMap {
  const ol = new OlObservable() as any;
  ol.getInteractions = () => ({ getArray: () => [] });
  ol.addInteraction = vi.fn();
  ol.removeInteraction = vi.fn();

  return {
    ol,
    status$: new BehaviorSubject(SubjectStatus.Done),
    setTarget: vi.fn(),
    updateView: vi.fn(),
    updateControls: vi.fn(),
    projection: 'EPSG:3857',
    layerController: { all: [] } as unknown as LayerController
  } as unknown as IgoMap;
}

@Component({
  template: '<igo-map-browser [map]="map" igoQuery></igo-map-browser>',
  standalone: true,
  imports: [MapBrowserComponent, QueryDirective]
})
class HostComponent {
  readonly map = createMapMock() as any;
}

describe('QueryDirective', () => {
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
      By.directive(QueryDirective)
    );
    const directive = directiveEl.injector.get(QueryDirective);

    expect(directive).toBeTruthy();
  });

  it('should initialize and teardown without errors', () => {
    fixture.detectChanges();

    expect(() => fixture.destroy()).not.toThrow();
  });
});
