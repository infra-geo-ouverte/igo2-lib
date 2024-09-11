import { FlatTreeControl } from '@angular/cdk/tree';
import { Component, DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  MatTreeFlatDataSource,
  MatTreeFlattener,
  MatTreeModule,
  MatTreeNode
} from '@angular/material/tree';
import { By } from '@angular/platform-browser';

import { TreeDragDropDirective } from './tree-drag-drop.directive';
import { DropPositionType, TreeFlatNode } from './tree-drag-drop.interface';
import { TREE_MOCK } from './tree-drag-drop.mock';

@Component({
  template: `
    <mat-tree
      igoTreeDragDrop
      [treeControl]="treeControl"
      [dataSource]="dataSource"
    >
      <mat-tree-node *matTreeNodeDef="let node">
        <div>Test</div>
      </mat-tree-node>
    </mat-tree>
  `
})
class TestComponent {
  treeControl = new FlatTreeControl<any>(
    (node) => node.level,
    (node) => node.isGroup
  );

  private _transformer = (node: any, level: number): any => {
    return {
      id: node.id,
      level: level,
      data: node,
      disabled: false
    };
  };
  treeFlattener = new MatTreeFlattener(
    this._transformer,
    (node) => node.level,
    (node) => node.isGroup,
    (node) => node.children.sort((a, b) => a.zIndex + b.zIndex)
  );

  dataSource = new MatTreeFlatDataSource<any, any>(
    this.treeControl,
    this.treeFlattener,
    TREE_MOCK
  );
}

describe('DragDropTreeDirective', () => {
  let fixture: ComponentFixture<TestComponent>;
  let directive: TreeDragDropDirective;
  let treeControl: FlatTreeControl<TreeFlatNode>;
  let treeNodesDebug: DebugElement[];

  beforeEach(() => {
    fixture = TestBed.configureTestingModule({
      imports: [MatTreeModule, TreeDragDropDirective],
      declarations: [TestComponent]
    }).createComponent(TestComponent);

    fixture.detectChanges();
    const debugElement = fixture.debugElement.query(
      By.directive(TreeDragDropDirective)
    );
    directive = debugElement.injector.get(TreeDragDropDirective);
    treeControl = directive.treeControl;

    treeNodesDebug = fixture.debugElement.queryAll(By.directive(MatTreeNode));
  });

  it('should create an instance', () => {
    expect(directive).toBeTruthy();
  });

  it('should add draggable attributes on tree nodes', () => {
    expect(treeNodesDebug.length).toBeGreaterThan(0);
    treeNodesDebug.forEach((node) => {
      const element = node.nativeElement;
      expect(element.getAttribute('draggable')).toBe('true');
    });
  });

  it('should handle drag start and end events', () => {
    const treeNode = treeNodesDebug[0].nativeElement;
    const dragStartEvent = new DragEvent('dragstart');
    const dragEndEvent = new DragEvent('dragend');

    spyOn(directive, 'onDragStart').and.callThrough();
    spyOn(directive, 'dragEnd').and.callThrough();

    treeNode.dispatchEvent(dragStartEvent);
    expect(directive.onDragStart).toHaveBeenCalled();

    treeNode.dispatchEvent(dragEndEvent);
    expect(directive.dragEnd).toHaveBeenCalled();
  });

  it('should handle drag over and leave events', () => {
    const treeNodeDragged = treeNodesDebug[1].nativeElement;
    const treeNode = treeNodesDebug[0].nativeElement;
    const dragStartEvent = new DragEvent('dragstart');
    const dragOverEvent = new DragEvent('dragover');
    const dragLeaveEvent = new DragEvent('dragleave');

    treeNodeDragged.dispatchEvent(dragStartEvent);

    spyOn(directive, 'dragOver').and.callThrough();
    spyOn(directive, 'dragLeave').and.callThrough();

    treeNode.dispatchEvent(dragOverEvent);
    expect(directive.dragOver).toHaveBeenCalled();

    treeNode.dispatchEvent(dragLeaveEvent);
    expect(directive.dragLeave).toHaveBeenCalled();
  });

  it('should handle drop event', () => {
    const treeNodeDragged = treeNodesDebug[1].nativeElement;
    const treeNode = treeNodesDebug[0].nativeElement;

    const dropEvent = new DragEvent('drop');
    const dragStartEvent = new DragEvent('dragstart');
    const dragOverEvent = new DragEvent('dragover');

    treeNodeDragged.dispatchEvent(dragStartEvent);
    treeNode.dispatchEvent(dragOverEvent);

    spyOn(directive, 'drop').and.callThrough();
    spyOn(directive.onDrop, 'emit').and.callThrough();

    directive.drop(dropEvent);
    expect(directive.drop).toHaveBeenCalledWith(dropEvent);
  });

  it('should emit onDrop event with correct data', () => {
    const draggedNode: TreeFlatNode = treeControl.dataNodes.find(
      (node) => !node.isGroup
    );
    const ref: TreeFlatNode = treeControl.dataNodes.find(
      (node) => node.id !== draggedNode.id
    );
    const position: DropPositionType = 'inside';

    spyOn<any>(directive, 'getPosition').and.returnValue({
      x: 0,
      y: 0,
      level: ref.level,
      type: position
    });
    spyOn(directive.onDrop, 'emit').and.callThrough();

    directive.draggedNode = draggedNode;
    directive.dropNodeTarget = ref;
    directive.drop(new DragEvent('drop'));

    expect(directive.onDrop.emit).toHaveBeenCalledWith({
      node: draggedNode,
      ref,
      position
    });
  });
});

// describe('DragDropTreeDirective - NodeGroup', () => {
//   it('should not drop into itself', () => {});
//   it('should not hover children', () => {});
//   it('should active inside on hover', () => {});
// });

// describe('DragDropTreeDirective - NodeItem', () => {
//   it('should not hover with "inside" itself', () => {});
//   it('should drop into a group', () => {});
// });
