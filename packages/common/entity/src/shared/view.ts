import { ObjectUtils, uuid } from '@igo2/utils';

import { BehaviorSubject, Observable, Subscription, combineLatest } from 'rxjs';
import { debounceTime, map, skip } from 'rxjs/operators';

import {
  EntityFilterClause,
  EntityJoinClause,
  EntityKey,
  EntitySortClause
} from './entity.interfaces';

/**
 * An entity view streams entities from an observable source. These entities
 * can be filtered or sorted without affecting the source. A view can also
 * combine data from multiple sources, joined together.
 */
export class EntityView<E extends object, V extends object = E> {
  /**
   * Observable stream of values
   */
  readonly values$ = new BehaviorSubject<V[]>([]);

  /**
   * Subscription to the source (and joined sources) values
   */
  private values$$: Subscription;

  /**
   * Whether this view has been lifted
   */
  private lifted = false;

  /**
   * Join clauses
   */
  private joins: EntityJoinClause[] = [];

  /**
   * Observable of a filter clause
   */
  private filter$ = new BehaviorSubject(undefined);

  /**
   * Observable of filter clauses
   */
  private filters$ = new BehaviorSubject<EntityFilterClause[]>(
    []
  );

  /**
   * Filters index
   */
  private filterIndex = new Map<string, EntityFilterClause>();

  /**
   * Observable of a sort clause
   */
  private sort$ = new BehaviorSubject(undefined);

  /**
   * Method for indexing
   */
  get getKey(): (V) => EntityKey {
    return this.getKey$.value;
  }
  private getKey$ = new BehaviorSubject<(V) => EntityKey>(
    undefined
  );

  /**
   * Number of entities
   */
  readonly count$ = new BehaviorSubject<number>(0);
  get count(): number {
    return this.count$.value;
  }

  /**
   * Whether the store is empty
   */
  readonly empty$ = new BehaviorSubject<boolean>(true);
  get empty(): boolean {
    return this.empty$.value;
  }

  /**
   * Store index
   */
  get index(): Map<EntityKey, V> {
    return this._index;
  }
  private _index: Map<EntityKey, V>;

  constructor(private source$: BehaviorSubject<E[]>) {}

  /**
   * Get a value from the view by key
   * @param key Key
   * @returns Value
   */
  get(key: EntityKey): V {
    if (this._index === undefined) {
      throw new Error(
        'This view has no index, therefore, this method is unavailable.'
      );
    }
    return this.index.get(key);
  }

  /**
   * Get all the values
   * @returns Array of values
   */
  all(): V[] {
    return this.values$.value;
  }

  /**
   * Observe all the values
   * @returns Observable of values
   */
  all$(): BehaviorSubject<V[]> {
    return this.values$;
  }

  /**
   * Get the first value that respects a criteria
   * @returns A value
   */
  firstBy(clause: EntityFilterClause<V>): V {
    return this.values$.value.find(clause);
  }

  /**
   * Observe the first value that respects a criteria
   * @returns Observable of a value
   */
  firstBy$(clause: EntityFilterClause<V>): Observable<V> {
    return this.values$.pipe(map((values: V[]) => values.find(clause)));
  }

  /**
   * Get all the values that respect a criteria
   * @returns Array of values
   */
  manyBy(clause: EntityFilterClause<V>): V[] {
    return this.values$.value.filter(clause);
  }

  /**
   * Observe all the values that respect a criteria
   * @returns Observable of values
   */
  manyBy$(clause: EntityFilterClause<V>): Observable<V[]> {
    return this.values$.pipe(map((values: V[]) => values.filter(clause)));
  }

  /**
   * Clear the filter and sort and unsubscribe from the source
   */
  clear() {
    this.filter(undefined);
    this.sort(undefined);
  }

  destroy() {
    if (this.values$$ !== undefined) {
      this.values$$.unsubscribe();
    }
    this.clear();
  }

  /**
   * Create an index
   * @param getKey Method to get a value's id
   * @returns The view
   */
  createIndex(getKey: (E) => EntityKey): EntityView<E, V> {
    this._index = new Map();
    this.getKey$.next(getKey);
    return this;
  }

  /**
   * Join another source to the stream (chainable)
   * @param clause Join clause
   * @returns The view
   */
  join(clause: EntityJoinClause): EntityView<E, V> {
    if (this.lifted === true) {
      throw new Error(
        'This view has already been lifted, therefore, no join is allowed.'
      );
    }
    this.joins.push(clause);
    return this;
  }

  /**
   * Filter values (chainable)
   * @param clause Filter clause
   * @returns The view
   */
  filter(clause: EntityFilterClause<V>): EntityView<E, V> {
    this.filter$.next(clause);
    return this;
  }

  /**
   * @param clause Filter clause
   * @returns The filter id
   */
  addFilter(clause: EntityFilterClause<V>): string {
    const id = uuid();
    this.filterIndex.set(id, clause);
    this.filters$.next(Array.from(this.filterIndex.values()));
    return id;
  }

  /**
   * Remove a filter by id
   * @param clause Filter clause
   */
  removeFilter(id: string) {
    this.filterIndex.delete(id);
    this.filters$.next(Array.from(this.filterIndex.values()));
  }

  /**
   * Sort values (chainable)
   * @param clauseSort clause
   * @returns The view
   */
  sort(clause: EntitySortClause<V>): EntityView<E, V> {
    this.sort$.next(clause);
    return this;
  }

  /**
   * Create the final observable
   * @returns Observable
   */
  lift() {
    this.lifted = true;
    const source$ =
      this.joins.length > 0 ? this.liftJoinedSource() : this.liftSource();
    const observables$ = [
      source$,
      this.filters$,
      this.filter$,
      this.sort$,
      this.getKey$
    ];

    this.values$$ = combineLatest(observables$)
      .pipe(skip(1), debounceTime(5))
      .subscribe((bunch: any[]) => {
        const [_values, filters, filter, sort, getKey] = bunch;
        const values = this.processValues(_values, filters, filter, sort);
        const generateIndex = getKey !== undefined;
        this.setValues(values, generateIndex);
      });
  }

  /**
   * Create the source observable when no joins are defined
   * @returns Observable
   */
  private liftSource(): Observable<V[]> {
    return this.source$ as any as Observable<V[]>;
  }

  /**
   * Create the source observable when joins are defined
   * @returns Observable
   */
  private liftJoinedSource(): Observable<V[]> {
    const sources$ = [
      this.source$,
      combineLatest(this.joins.map((join: EntityJoinClause) => join.source))
    ];

    return combineLatest(sources$).pipe(
      map((bunch: [E[], any[]]) => {
        const [entities, joinData] = bunch;
        return entities.reduce((values: V[], entity: E) => {
          const value = this.computeJoinedValue(entity, joinData);
          if (value !== undefined) {
            values.push(value);
          }
          return values;
        }, []);
      })
    );
  }

  /**
   * Apply joins to a source's entity and return the final value
   * @returns Final value
   */
  private computeJoinedValue(entity: E, joinData: any[]): V | undefined {
    let value = entity as Partial<V>;
    let joinIndex = 0;
    while (value !== undefined && joinIndex < this.joins.length) {
      value = this.joins[joinIndex].reduce(value, joinData[joinIndex]);
      joinIndex += 1;
    }
    return value as V;
  }

  /**
   * Filter and sort values before streaming them
   * @param values Values
   * @param filters Filter clauses
   * @param filter Filter clause
   * @param sort Sort clause
   * @returns Filtered and sorted values
   */
  private processValues(
    values: V[],
    filters: EntityFilterClause[],
    filter: EntityFilterClause,
    sort: EntitySortClause
  ): V[] {
    values = values.slice(0);
    values = this.filterValues(values, filters.concat([filter]));
    values = this.sortValues(values, sort);
    return values;
  }

  /**
   * Filter values
   * @param values Values
   * @param filters Filter clauses
   * @returns Filtered values
   */
  private filterValues(values: V[], clauses: EntityFilterClause[]): V[] {
    if (clauses.length === 0) {
      return values;
    }

    return values.filter((value: V) => {
      return clauses
        .filter((clause: EntityFilterClause) => clause !== undefined)
        .every((clause: EntityFilterClause) => clause(value));
    });
  }

  /**
   * Sort values
   * @param values Values
   * @param sort Sort clause
   * @returns Sorted values
   */
  private sortValues(values: V[], clause: EntitySortClause): V[] {
    if (clause === undefined) {
      return values;
    }
    return values.sort((v1: V, v2: V) => {
      return ObjectUtils.naturalCompare(
        clause.valueAccessor(v1),
        clause.valueAccessor(v2),
        clause.direction,
        clause.nullsFirst
      );
    });
  }

  /**
   * Set value and optionally generate an index
   * @param values Values
   * @param generateIndex boolean
   */
  private setValues(values: V[], generateIndex: boolean) {
    if (generateIndex === true) {
      this._index = this.generateIndex(values);
    }

    this.values$.next(values);

    const count = values.length;
    const empty = count === 0;
    this.count$.next(count);
    this.empty$.next(empty);
  }

  /**
   * Generate a complete index of all the values
   * @param entities Entities
   * @returns Index
   */
  private generateIndex(values: V[]): Map<EntityKey, V> {
    const entries = values.map((value: V) => [this.getKey(value), value]);
    return new Map(entries as [EntityKey, V][]);
  }
}
