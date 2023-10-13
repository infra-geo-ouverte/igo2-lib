import {
  ChangeDetectionStrategy,
  Component,
  HostBinding,
  Input,
  OnDestroy,
  OnInit
} from '@angular/core';

import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';

import { Action, ActionStore } from '../../action';
import { Tool } from '../shared/tool.interface';
import { Toolbox } from '../shared/toolbox';
import { ToolboxColor } from '../shared/toolbox.enums';
import { toolSlideInOut } from './toolbox.animation';

@Component({
  selector: 'igo-toolbox',
  templateUrl: 'toolbox.component.html',
  styleUrls: ['toolbox.component.scss'],
  animations: [toolSlideInOut()],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ToolboxComponent implements OnInit, OnDestroy {
  /**
   * Observable of the active tool
   */
  activeTool$: BehaviorSubject<Tool> = new BehaviorSubject(undefined);

  get isActive(): boolean {
    return !!this.activeTool$.value;
  }

  /**
   * Store of actions that toggle tools
   */
  actionStore: ActionStore = new ActionStore([]);

  /**
   * Observable of he anmation state
   */
  animation$: BehaviorSubject<string> = new BehaviorSubject('none');

  /**
   * Observable of the toolbar
   */
  toolbar$: BehaviorSubject<string[]> = new BehaviorSubject([]);

  /**
   * Whether the Toolbar should display actions' titles
   */
  toolbarWithTitle$: Observable<boolean> = this.activeTool$.pipe(
    map((tool: Tool | undefined) => tool === undefined)
  );

  /**
   * Subscription to the active tool
   */
  private activeTool$$: Subscription;

  /**
   * Subscription to the toolbar
   */
  private toolbar$$: Subscription;

  /**
   * Observable of the ongoing animation. This is useful when
   * multiple animations are triggered at once i.e. when the user clicks
   * too fast on different actions
   */
  private animating$ = new BehaviorSubject<boolean>(false);

  /**
   * Subscription to the ongoing animation
   */
  private animating$$: Subscription;

  /**
   * Toolbox
   */
  @Input() toolbox: Toolbox;

  /**
   * Whether the toolbox should animate the first tool entering
   */
  @Input() animate: boolean = false;

  /**
   * Color of Toolbox
   */
  @Input() color: ToolboxColor = ToolboxColor.White;

  /**
   * @ignore
   */
  @HostBinding('class.color-grey')
  get classColorGrey() {
    return this.color === ToolboxColor.Grey;
  }

  /**
   * @ignore
   */
  @HostBinding('class.color-primary')
  get classColorPrimary() {
    return this.color === ToolboxColor.Primary;
  }

  /**
   * Initialize the toolbar and subscribe to the active tool
   * @internal
   */
  ngOnInit() {
    this.toolbar$$ = this.toolbox.toolbar$.subscribe((toolbar: string[]) =>
      this.onToolbarChange(toolbar)
    );
    this.activeTool$$ = this.toolbox.activeTool$.subscribe((tool: Tool) =>
      this.onActiveToolChange(tool)
    );
  }

  /**
   * Unsubscribe to the active tool and destroy the action store
   * @internal
   */
  ngOnDestroy() {
    this.toolbar$$.unsubscribe();
    this.activeTool$$.unsubscribe();
    this.actionStore.destroy();
  }

  /**
   * Track the starting animation
   * @internal
   */
  onAnimationStart() {
    this.animating$.next(true);
  }

  /**
   * Untrack the completed animation
   * @internal
   */
  onAnimationComplete() {
    this.animating$.next(false);
  }

  /**
   * Return a tool's inputs
   * @param tool Tool
   * @returns Tool inputs
   * @internal
   */
  getToolInputs(tool: Tool): { [key: string]: any } {
    return tool.options || {};
  }

  /**
   * Initialize an action store
   * @param toolbar Toolbar
   */
  private onToolbarChange(toolbar: string[]) {
    this.setToolbar(toolbar);
  }

  /**
   * Activate a tool and trigger an animation or not
   * @param tool Tool to activate
   */
  private onActiveToolChange(tool: Tool) {
    if (!this.animate) {
      this.setActiveTool(tool);
      return;
    }
    this.onAnimate(() => this.setActiveTool(tool));
  }

  /**
   * Set the active tool
   * @param tool Tool to activate
   */
  private setActiveTool(tool: Tool | undefined) {
    if (tool === undefined) {
      this.actionStore.state.updateAll({ active: false });
    } else {
      const action = this.actionStore.get(tool.name);
      if (action !== undefined) {
        this.actionStore.state.update(action, { active: true }, true);
      }
    }

    this.activeTool$.next(tool);
    if (this.animate) {
      this.animation$.next('enter');
    }
  }

  /**
   * Initialize the toolbar
   */
  private setToolbar(toolbar: string[]) {
    const actions = toolbar.reduce((acc: Action[], toolName: string) => {
      const tool = this.toolbox.getTool(toolName);
      if (tool === undefined) {
        return acc;
      }

      acc.push({
        id: tool.name,
        title: tool.title,
        icon: tool.icon,
        // iconImage: tool.iconImage,
        tooltip: tool.tooltip,
        args: [tool, this.toolbox],
        handler: (_tool: Tool, _toolbox: Toolbox) => {
          _toolbox.activateTool(_tool.name);
        },
        ngClass: (_tool: Tool, _toolbox: Toolbox) => {
          return this.toolbox.activeTool$.pipe(
            map((activeTool: Tool) => {
              let toolActivated = false;
              if (activeTool !== undefined && _tool.name === activeTool.name) {
                toolActivated = true;
              }

              let childrenToolActivated = false;
              if (
                activeTool !== undefined &&
                _tool.name === activeTool.parent
              ) {
                childrenToolActivated = true;
              }

              return {
                'tool-activated': toolActivated,
                'children-tool-activated': childrenToolActivated
              };
            })
          );
        }
      });
      return acc;
    }, []);
    this.actionStore.load(actions);
    this.toolbar$.next(toolbar);
  }

  /**
   * Observe the ongoing animation and ignore any incoming animation
   * while one is still ongoing.
   * @param callback Callback to execute when the animation completes
   */
  private onAnimate(callback: () => void) {
    this.unAnimate();
    this.animating$$ = this.animating$.subscribe((animation: boolean) => {
      if (!animation) {
        callback.call(this);
        this.unAnimate();
      }
    });
  }

  /**
   * Stop observing an animation when it's complete
   */
  private unAnimate() {
    if (this.animating$$) {
      this.animating$$.unsubscribe();
    }
  }
}
