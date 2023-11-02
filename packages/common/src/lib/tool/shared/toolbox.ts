import { BehaviorSubject, Subscription } from 'rxjs';

import { EntityRecord, EntityStore } from '../../entity';
import { Tool, ToolboxOptions } from './tool.interface';

/**
 * Service where all available tools and their component are registered.
 */
export class Toolbox {
  /**
   * Observable of the active tool
   */
  activeTool$: BehaviorSubject<Tool> = new BehaviorSubject(undefined);

  /**
   * Ordered list of tool names to display in a toolbar
   */
  toolbar$: BehaviorSubject<string[]> = new BehaviorSubject([]);

  /**
   * Observable of the active tool
   */
  private activeTool$$: Subscription;

  /**
   * Active tool history. Useful for activating the previous tool.
   */
  private activeToolHistory: string[] = [];

  /**
   * Tool store
   */
  private store = new EntityStore<Tool>([], {
    getKey: (tool: Tool) => tool.name
  });

  get tools$(): BehaviorSubject<Tool[]> {
    return this.store.entities$;
  }

  constructor(private options: ToolboxOptions = {}) {
    this.setToolbar(options.toolbar);
    this.initStore();
  }

  /**
   * Destroy the toolbox
   */
  destroy() {
    this.activeTool$$.unsubscribe();
    this.store.destroy();
  }

  /**
   * Return a tool
   * @param name Tool name
   * @returns tool Tool
   */
  getTool(name: string): Tool {
    return this.store.get(name);
  }

  /**
   * Return all tools
   * @returns Array of tools
   */
  getTools(): Tool[] {
    return this.store.all();
  }

  /**
   * Set tool configurations
   * @param tools Tools
   */
  setTools(tools: Tool[]) {
    this.store.load(tools);
  }

  /**
   * Get toolbar
   * @returns Toolbar value
   */
  getToolbar(): string[] {
    return this.toolbar$.getValue();
  }

  /**
   * Set toolbar
   * @param toolbar A list of tool names
   */
  setToolbar(toolbar: string[]) {
    this.toolbar$.next(toolbar || []);
  }

  /**
   * Activate a tool (and deactivate other tools)
   * @param name Tool name
   * @param options Tool options
   */
  activateTool(name: string, options: { [key: string]: any } = {}) {
    const tool = this.getTool(name);
    if (tool === undefined) {
      return;
    }

    this.store.state.update(tool, { active: true, options }, true);
  }

  /**
   * Activate the previous tool, if any
   */
  activatePreviousTool() {
    if (this.activeToolHistory.length <= 1) {
      this.deactivateTool();
      return;
    }
    const [previous, current] = this.activeToolHistory.splice(-2, 2);
    this.activateTool(previous);
  }

  /**
   * Activate the tool below, if any
   */
  /* activateBelowTool() {
    const arrayTools = this.getToolbar();
    const index = arrayTools.findIndex(t => t === this.activeTool$.getValue().name);
    if (arrayTools[index + 1] !== undefined) {
      this.deactivateTool();
      const below = arrayTools[index + 1];
      this.activateTool(below);
    } else {
      this.deactivateTool();
      const below = arrayTools[0];
      this.activateTool(below);
    }
  } */

  /**
   * Activate the tool above, if any
   */
  /* activateAboveTool() {
    const arrayTools = this.getToolbar();
    const index = arrayTools.findIndex(t => t === this.activeTool$.getValue().name);
    if (arrayTools[index - 1] !== undefined) {
      this.deactivateTool();
      const above = arrayTools[index - 1];
      this.activateTool(above);
    } else {
      this.deactivateTool();
      const above = arrayTools[arrayTools.length - 1];
      this.activateTool(above);
    }
  } */

  /**
   * Deactivate the active tool
   */
  deactivateTool() {
    this.clearActiveToolHistory();
    this.store.state.updateAll({ active: false });
  }

  /**
   * Initialize the tool store and start observing the active tool
   */
  private initStore() {
    this.store = new EntityStore<Tool>([], {
      getKey: (entity: Tool) => entity.name
    });

    this.activeTool$$ = this.store.stateView
      .firstBy$((record: EntityRecord<Tool>) => record.state.active === true)
      .subscribe((record: EntityRecord<Tool>) => {
        if (record === undefined) {
          this.setActiveTool(undefined);
          return;
        }

        const tool = record.entity;
        const options = Object.assign(
          {},
          tool.options || {},
          record.state.options || {}
        );
        this.setActiveTool(Object.assign({}, tool, { options }));
      });
  }

  /**
   * Set the active tool and update the tool history
   * @param tool Tool
   */
  private setActiveTool(tool: Tool | undefined) {
    this.activeTool$.next(tool);
    if (tool === undefined) {
      this.clearActiveToolHistory();
    } else {
      this.activeToolHistory = this.activeToolHistory
        .filter((name: string) => name !== tool.name)
        .concat([tool.name]);
    }
  }

  /**
   * Clear the tool history
   */
  private clearActiveToolHistory() {
    this.activeToolHistory = [];
  }
}
