import { EntityRecord, EntityStore } from '../../entity';
import { Tool } from './tool.interface';
import { BehaviorSubject, Subscription } from 'rxjs';

/**
 * Service where all available tools and their component are registered.
 */
export class Toolbox {

  activeTool$: BehaviorSubject<Tool> = new BehaviorSubject(undefined);

  activeToolHistory: string[] = [];

  private activeTool$$: Subscription;

  private store = new EntityStore<Tool>([], {
    getKey: (tool: Tool) => tool.name
  });

  constructor() {
    this.initStore();
  }

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

  addTool(tool: Tool) {
    this.store.update(tool);
  }

  /**
   * Set tool configurations
   * @param tools Tools
   */
  setTools(tools: Tool[]) {
    this.store.load(tools);
  }

  activateTool(name: string, options: {[key: string]: any} = {}) {
    const tool = this.getTool(name);
    this.store.state.update(tool, {active: true, options}, true);
  }

  activatePreviousTool() {
    if (this.activeToolHistory.length <= 1) {
      this.deactivateTool();
      return;
    }
    const [previous, current] = this.activeToolHistory.splice(-2, 2);
    this.activateTool(previous);
  }

  deactivateTool() {
    this.clearActiveToolHistory();
    this.store.state.updateAll({active: false});
  }

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
        this.setActiveTool(Object.assign({}, tool, {options}));
      });
  }

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

  private clearActiveToolHistory() {
    this.activeToolHistory = [];
  }
}
