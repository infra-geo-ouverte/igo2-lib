import { ComponentFixture, TestBed } from '@angular/core/testing';

import { provideMockTranslation } from '@igo2/core/language';
import { MessageService } from '@igo2/core/message';

import { OSMDataSource } from '../../datasource/shared/datasources/osm-datasource';
import { IgoMap } from '../../map';
import { LayerController } from '../shared/layer-controller';
import { LayerService } from '../shared/layer.service';
import { AnyLayer, LayerGroup } from '../shared/layers';
import { LayerListComponent } from './layer-list.component';

describe('LayerListComponent', () => {
  let component: LayerListComponent;
  let fixture: ComponentFixture<LayerListComponent>;
  let map: IgoMap;
  let controller: LayerController;
  let layerService: LayerService;
  let layers: AnyLayer[];

  const createLayer = (id: string, zIndex: number): AnyLayer => {
    const layer = layerService.createLayer({
      id,
      title: id,
      zIndex,
      source: new OSMDataSource()
    });
    layer.init(map);
    return layer;
  };

  const createGroup = (
    id: string,
    children: AnyLayer[] = [],
    zIndex = 5
  ): LayerGroup => {
    const group = new LayerGroup(children, {
      id,
      title: id,
      type: 'group',
      zIndex
    });
    group.init(map);
    return group;
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LayerListComponent],
      providers: [
        provideMockTranslation(),
        { provide: MessageService, useValue: { alert: vi.fn() } }
      ]
    }).compileComponents();

    map = new IgoMap();
    layerService = TestBed.inject(LayerService);
    layers = [
      createLayer('layer-a', 4),
      createLayer('layer-b', 3),
      createLayer('layer-c', 2)
    ];
    controller = new LayerController(map, [...layers]);

    fixture = TestBed.createComponent(LayerListComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('controller', controller);
    fixture.componentRef.setInput('layers', [...controller.treeLayers]);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('dropNode', () => {
    it('should move the dragged node above, below, or inside the reference node', () => {
      const group = createGroup('group-1');
      controller = new LayerController(map, [group, ...layers]);
      fixture.componentRef.setInput('controller', controller);

      const moveAboveSpy = vi.spyOn(controller, 'moveAbove');
      const moveBelowSpy = vi.spyOn(controller, 'moveBelow');
      const moveInsideSpy = vi.spyOn(controller, 'moveInside');

      component.dropNode({
        node: layers[2],
        ref: layers[0],
        position: 'above'
      });
      expect(moveAboveSpy).toHaveBeenCalledWith(layers[0], layers[2]);

      component.dropNode({
        node: layers[0],
        ref: layers[2],
        position: 'below'
      });
      expect(moveBelowSpy).toHaveBeenCalledWith(layers[2], layers[0]);

      component.dropNode({
        node: layers[0],
        ref: group,
        position: 'inside'
      });
      expect(moveInsideSpy).toHaveBeenCalledWith(group, layers[0]);
    });

    it('should filter out selected groups that contain the drop target to prevent circular hierarchy', () => {
      const childInGroup = createLayer('child-1', 1);
      const group = createGroup('group-1', [childInGroup]);

      controller = new LayerController(map, [group, ...layers]);
      fixture.componentRef.setInput('controller', controller);

      controller.select(group, layers[0]);
      const moveBelowSpy = vi.spyOn(controller, 'moveBelow');

      component.dropNode({
        node: layers[0],
        ref: childInGroup,
        position: 'below'
      });

      expect(moveBelowSpy).toHaveBeenCalledWith(childInGroup, layers[0]);
    });

    it('should filter out descendants of any selected group when moving multiple nodes', () => {
      const childInGroup = createLayer('child-1', 1);
      const group = createGroup('group-1', [childInGroup]);

      controller = new LayerController(map, [group, ...layers]);
      fixture.componentRef.setInput('controller', controller);

      // Select child first, then group, and drag another layer
      controller.select(childInGroup, group, layers[0]);
      const moveAboveSpy = vi.spyOn(controller, 'moveAbove');

      component.dropNode({
        node: layers[0],
        ref: layers[2],
        position: 'above'
      });

      expect(moveAboveSpy).toHaveBeenCalledWith(layers[2], group, layers[0]);
    });

    it('should exclude the reference node when it is part of the selection', () => {
      const group = createGroup('group-1');

      controller = new LayerController(map, [group, ...layers]);
      fixture.componentRef.setInput('controller', controller);

      controller.select(group, layers[0]);
      const moveInsideSpy = vi.spyOn(controller, 'moveInside');

      component.dropNode({
        node: layers[0],
        ref: group,
        position: 'inside'
      });

      expect(moveInsideSpy).toHaveBeenCalledWith(group, layers[0]);
    });
  });
});
