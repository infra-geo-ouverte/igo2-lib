import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  Input,
  ComponentRef,
  ComponentFactoryResolver,
  OnDestroy,
  OnInit,
  ViewContainerRef,
  ViewChild
} from '@angular/core';

import { Subscription, BehaviorSubject } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';

import { ToolService } from '../shared/tool.service';
import { Tool } from '../shared/tool.interface';
import { toolSlideInOut } from './toolbox.animation';

@Component({
  selector: 'igo-toolbox',
  templateUrl: 'toolbox.component.html',
  styleUrls: ['toolbox.component.scss'],
  animations: [toolSlideInOut()]
})
export class ToolboxComponent implements AfterViewInit, OnInit, OnDestroy {
  @ViewChild('target', { read: ViewContainerRef })
  target: ViewContainerRef;

  @Input()
  get animate() {
    return this._animate;
  }
  set animate(value: boolean) {
    this._animate = value;
  }
  private _animate = false;

  get toolState(): string {
    if (!this.animate) {
      return 'none';
    }

    return this._toolState;
  }
  private _toolState = 'center';

  private component: ComponentRef<Component>;
  private depth = 0;
  private selectedTool: Tool;
  private toolHistory$$: Subscription;
  private viewInitialized = false;
  private animating$ = new BehaviorSubject<boolean>(false);
  private animating$$: Subscription;

  constructor(
    private resolver: ComponentFactoryResolver,
    private cdRef: ChangeDetectorRef,
    private toolService: ToolService
  ) {}

  ngOnInit() {
    this.toolHistory$$ = this.toolService.toolHistory$
      .pipe(distinctUntilChanged())
      .subscribe((toolHistory: Tool[]) => {
        if (!this.animate) {
          this.handleToolHistoryChange(toolHistory);
        } else {
          this.subscribeToAnimation(() =>
            this.handleToolHistoryChange(toolHistory)
          );
        }
      });
  }

  ngOnDestroy() {
    this.toolHistory$$.unsubscribe();
    this.viewInitialized = false;
    this.destroyComponent();
  }

  ngAfterViewInit() {
    this.viewInitialized = true;
    this.createComponent(this.selectedTool);
  }

  animationStart(event) {
    this.animating$.next(true);
  }

  animationDone(event) {
    this.animating$.next(false);
  }

  private subscribeToAnimation(callback: Function) {
    this.unsubscribeToAnimation();
    this.animating$$ = this.animating$.subscribe(animating => {
      if (!animating) {
        callback.call(this);
        this.unsubscribeToAnimation();
      }
    });
  }

  private unsubscribeToAnimation() {
    if (this.animating$$) {
      this.animating$$.unsubscribe();
    }
  }

  private handleToolHistoryChange(toolHistory?: Tool[]) {
    const depth = toolHistory.length;
    this._toolState = depth >= this.depth ? 'right' : 'left';

    this.depth = depth;
    this.selectTool(toolHistory[depth - 1]);
  }

  private selectTool(tool: Tool) {
    if (this.viewInitialized) {
      if (tool) {
        this.createComponent(tool);
      } else {
        this.destroyComponent();
      }
    }

    this.selectedTool = tool;
    this._toolState = 'center';
  }

  private createComponent(tool) {
    const selectedTool = this.selectedTool;

    if (!this.viewInitialized || !tool) {
      return;
    }

    /* If the component is created already, simply update its options */
    if (this.component && selectedTool && selectedTool.name === tool.name) {
      this.setOptions(tool.options);
      return;
    }

    const toolCls = this.toolService.getToolClass(tool.name);
    if (toolCls === undefined) {
      return;
    }

    this.destroyComponent();

    const factory = this.resolver.resolveComponentFactory(<any>toolCls);
    const component = this.target.createComponent(factory);

    this.component = component as ComponentRef<Component>;
    this.setOptions(tool.options);

    this.cdRef.detectChanges();
  }

  private destroyComponent() {
    if (this.component !== undefined) {
      this.component.destroy();
    }
  }

  private setOptions(options: any) {
    if (
      this.component !== undefined &&
      this.component.instance.hasOwnProperty('options')
    ) {
      this.component.instance['options'] = options || {};
    }
  }
}
