import olClusterSource from 'ol/source/Cluster';
import olSource from 'ol/source/Source';
import olVectorSource from 'ol/source/Vector';

import { Observable, Subscription } from 'rxjs';

import { LegendOptions } from '../../../layer/shared/layers/legend.interface';
import { generateIdFromSourceOptions } from '../../../utils/id-generator';
import { DataService } from './data.service';
import {
  DataSourceOptions,
  DatasourceEvent,
  EventName,
  Legend
} from './datasource.interface';

export abstract class DataSource {
  public id: string;
  public ol: olSource | olVectorSource | olClusterSource;
  private legend: Legend[];

  get saveableOptions(): Partial<DataSourceOptions> {
    return {
      id: this.options.id,
      type: this.options.type,
      url: this.options.url
    };
  }

  protected events = new Map<EventName, Subscription>();

  constructor(
    public options: DataSourceOptions = {},
    protected dataService?: DataService
  ) {
    this.options = options;
    this.id = this.options.id || this.generateId();
    this.ol = this.createOlSource();
  }

  protected abstract createOlSource(): olSource;

  protected generateId(): string {
    return generateIdFromSourceOptions(this.options);
  }

  public getLegend(): Legend[] {
    return this.legend ? this.legend : [];
  }

  public setLegend(options: LegendOptions): Legend[] {
    if (options.url) {
      this.legend = [{ url: options.url }];
    } else if (options.html) {
      this.legend = [{ html: options.html }];
    } else {
      this.legend = [];
    }

    return this.legend;
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

  private addEvent(name: EventName, obs: Observable<unknown>): void {
    const subscription = this.events.get(name);
    if (subscription) {
      subscription.unsubscribe();
    }
    this.events.set(name, obs.subscribe());
  }

  public destroy(): void {
    this.events.forEach((lisner) => {
      lisner.unsubscribe();
    });
  }

  protected abstract onUnwatch();
}
