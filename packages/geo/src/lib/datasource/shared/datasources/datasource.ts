import olClusterSource from 'ol/source/Cluster';
import olSource from 'ol/source/Source';
import olVectorSource from 'ol/source/Vector';

import { Observable, Subscription } from 'rxjs';

import { Legend } from '../../../layer/shared/layers/legend.interface';
import { generateIdFromSourceOptions } from '../../../utils/id-generator';
import { DataService } from './data.service';
import {
  AnyEventName,
  DataSourceOptions,
  DatasourceEvent
} from './datasource.interface';

export abstract class DataSource {
  public id: string;
  public ol: olSource | olVectorSource | olClusterSource;

  get saveableOptions(): Partial<DataSourceOptions> {
    return {
      id: this.options.id,
      type: this.options.type,
      url: this.options.url
    };
  }

  protected events = new Map<AnyEventName, Subscription>();

  properties = new DatasourceProperties();

  constructor(
    public options: DataSourceOptions = {},
    protected dataService?: DataService
  ) {
    this.options = options;
    this.id = this.options.id || this.generateId();
    this.ol = this.createOlSource();
  }

  protected abstract createOlSource(): olSource;

  getLegend(): Legend {
    return;
  }

  protected generateId(): string {
    return generateIdFromSourceOptions(this.options);
  }

  refresh(): void {
    this.ol.refresh();
  }

  addEvents(events: DatasourceEvent[] = []): void {
    events.forEach(([name, observable]) => {
      this.addEvent(name, observable);
    });
  }

  removeEvents(): void {
    Array.from(this.events.entries()).forEach(([name, event]) => {
      event.unsubscribe();
      this.events.delete(name);
    });
  }

  private addEvent(name: AnyEventName, obs: Observable<unknown>): void {
    const subscription = this.events.get(name);
    if (subscription) {
      subscription.unsubscribe();
    }
    this.events.set(name, obs.subscribe());
  }

  public destroy(): void {
    this.events.forEach((listener) => {
      listener.unsubscribe();
    });
  }

  protected abstract onUnwatch();
}

class DatasourceProperties {
  /** General object to store general properties */
  private properties = new Map<string, unknown>();

  get(key: string): unknown {
    return this.properties.get(key);
  }

  getAll(): Record<string, unknown> {
    return { ...Object.fromEntries(this.properties.entries()) };
  }

  set(key: string, value: unknown): void {
    this.properties.set(key, value);
  }

  setMany(object: Record<string, unknown>): void {
    Object.entries(object).forEach(([key, value]) =>
      this.properties.set(key, value)
    );
  }

  delete(key: string): void {
    this.properties.delete(key);
  }
}
