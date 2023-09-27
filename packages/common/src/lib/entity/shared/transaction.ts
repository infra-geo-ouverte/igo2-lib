import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

import { BehaviorSubject } from 'rxjs';

import {
  EntityKey,
  EntityTransactionOptions,
  EntityOperationState
} from './entity.interfaces';
import { EntityStore } from './store';
import { EntityOperationType } from './entity.enums';
import { getEntityId } from './entity.utils';

interface EntityOperation<E extends object = object> {
  key: EntityKey;
  type: EntityOperationType;
  previous: E | undefined;
  current: E | undefined;
  store?: EntityStore<E>;
  meta?: { [key: string]: any };
}

export type EntityTransactionCommitHandler = (
  transaction: EntityTransaction,
  operations: EntityOperation[]
) => Observable<any>;

/**
 * This class holds a reference to the insert, update and delete
 * operations performed on a store. This is useful to commit
 * these operations in a single pass or to cancel them.
 */
export class EntityTransaction {
  /**
   * Store holding the operations on another store
   */
  readonly operations: EntityStore<EntityOperation, EntityOperationState>;

  /**
   * Method to get an entity's id
   */
  readonly getKey: (E) => EntityKey;

  /**
   * Whether there are pending operations
   */
  get empty$(): BehaviorSubject<boolean> {
    return this.operations.empty$;
  }

  /**
   * Whether there are pending operations
   */
  get empty(): boolean {
    return this.empty$.value;
  }

  /**
   * Whether thise store is in commit phase
   */
  get inCommitPhase(): boolean {
    return this.inCommitPhase$.value;
  }
  readonly inCommitPhase$: BehaviorSubject<boolean> = new BehaviorSubject(
    false
  );

  constructor(options: EntityTransactionOptions = {}) {
    this.getKey = options.getKey ? options.getKey : getEntityId;
    this.operations = new EntityStore<EntityOperation, EntityOperationState>(
      [],
      {
        getKey: (operation: EntityOperation) => operation.key
      }
    );
  }

  destroy() {
    this.operations.destroy();
  }

  /**
   * Insert an entity into a store. If no store is specified, an insert
   * operation is still created but the transaction won't add the new
   * entity to the store.
   * @param current The entity to insert
   * @param store Optional: The store to insert the entity into
   * @param meta Optional: Any metadata on the operation
   */
  insert(
    current: object,
    store?: EntityStore<object>,
    meta?: { [key: string]: any }
  ) {
    const existingOperation = this.getOperationByEntity(current);
    if (existingOperation !== undefined) {
      this.removeOperation(existingOperation);
    }

    this.doInsert(current, store, meta);
  }

  /**
   * Update an entity in a store. If no store is specified, an update
   * operation is still created but the transaction won't update the
   * entity into the store.
   * @param previous The entity before update
   * @param current The entity after update
   * @param store Optional: The store to update the entity into
   * @param meta Optional: Any metadata on the operation
   */
  update(
    previous: object,
    current: object,
    store?: EntityStore<object>,
    meta?: { [key: string]: any }
  ) {
    const existingOperation = this.getOperationByEntity(current);
    if (existingOperation !== undefined) {
      this.removeOperation(existingOperation);
      if (existingOperation.type === EntityOperationType.Insert) {
        this.doInsert(current, store, meta);
        return;
      } else if (existingOperation.type === EntityOperationType.Update) {
        previous = existingOperation.previous;
      }
    }

    this.doUpdate(previous, current, store, meta);
  }

  /**
   * Delete an entity from a store. If no store is specified, a delete
   * operation is still created but the transaction won't remove the
   * entity from the store.
   * @param previous The entity before delete
   * @param store Optional: The store to delete the entity from
   * @param meta Optional: Any metadata on the operation
   */
  delete(
    previous: object,
    store?: EntityStore<object>,
    meta?: { [key: string]: any }
  ) {
    const existingOperation = this.getOperationByEntity(previous);
    if (existingOperation !== undefined) {
      this.removeOperation(existingOperation);
      if (existingOperation.type === EntityOperationType.Insert) {
        if (store !== undefined) {
          store.delete(previous);
        }
        return;
      }
    }

    this.doDelete(previous, store, meta);
  }

  /**
   * Commit operations the transaction. This method doesn't do much
   * in itself. The handler it receives does the hard work and it's
   * implementation is left to the caller. This method simply wraps
   * the handler into an error catching mechanism to update
   * the transaction afterward. The caller needs to subscribe to this
   * method's output (observable) for the commit to be performed.
   * @param operations Operations to commit
   * @param handler Function that handles the commit operation
   * @returns The handler output (observable)
   */
  commit(
    operations: EntityOperation[],
    handler: EntityTransactionCommitHandler
  ): Observable<any> {
    this.inCommitPhase$.next(true);

    return handler(this, operations).pipe(
      catchError(() => of(new Error())),
      tap((result: any) => {
        if (result instanceof Error) {
          this.onCommitError(operations);
        } else {
          this.onCommitSuccess(operations);
        }
      })
    );
  }

  /**
   * Commit all the operations of the transaction.
   * @param handler Function that handles the commit operation
   * @returns The handler output (observable)
   */
  commitAll(handler: EntityTransactionCommitHandler): Observable<any> {
    const operations = this.getOperationsInCommit();
    return this.commit(operations, handler);
  }

  /**
   * Rollback this transaction
   */
  rollback() {
    this.rollbackOperations(this.operations.all());
  }

  /**
   * Rollback specific operations
   */
  rollbackOperations(operations: EntityOperation[]) {
    this.checkInCommitPhase();

    const operationsFactory = () =>
      new Map([
        [EntityOperationType.Delete, []],
        [EntityOperationType.Update, []],
        [EntityOperationType.Insert, []]
      ]);
    const storesOperations = new Map();

    // Group operations by store and by operation type.
    // Grouping operations allows us to revert them in bacth, thus, triggering
    // observables only one per operation type.
    for (const operation of operations) {
      const store = operation.store;
      if (operation.store === undefined) {
        continue;
      }

      let storeOperations = storesOperations.get(store);
      if (storeOperations === undefined) {
        storeOperations = operationsFactory();
        storesOperations.set(store, storeOperations);
      }
      storeOperations.get(operation.type).push(operation);
    }

    Array.from(storesOperations.keys()).forEach(
      (store: EntityStore<object>) => {
        const storeOperations = storesOperations.get(store);

        const deletes = storeOperations.get(EntityOperationType.Delete);
        store.insertMany(
          deletes.map((_delete: EntityOperation) => _delete.previous)
        );

        const updates = storeOperations.get(EntityOperationType.Update);
        store.updateMany(
          updates.map((_update: EntityOperation) => _update.previous)
        );

        const inserts = storeOperations.get(EntityOperationType.Insert);
        store.deleteMany(
          inserts.map((_insert: EntityOperation) => _insert.current)
        );
      }
    );

    this.operations.deleteMany(operations);
    this.inCommitPhase$.next(false);
  }

  /**
   * Clear this transaction
   * @todo Raise event and synchronize stores?
   */
  clear() {
    this.operations.clear();
    this.inCommitPhase$.next(false);
  }

  /**
   * Get any existing operation on an entity
   * @param entity Entity
   * @returns Either an insert, update or delete operation
   */
  getOperationByEntity(entity: object): EntityOperation {
    return this.operations.get(this.getKey(entity));
  }

  /**
   * Merge another transaction in this one
   * @param transaction Another transaction
   */
  mergeTransaction(transaction: EntityTransaction) {
    this.checkInCommitPhase();

    const operations = transaction.operations.all();
    operations.forEach((operation: EntityOperation) => {
      this.addOperation(operation);
    });
  }

  /**
   * Create an insert operation and add an entity to the store
   * @param current The entity to insert
   * @param store Optional: The store to insert the entity into
   * @param meta Optional: Any metadata on the operation
   */
  private doInsert(
    current: object,
    store?: EntityStore<object>,
    meta?: { [key: string]: any }
  ) {
    this.addOperation({
      key: this.getKey(current),
      type: EntityOperationType.Insert,
      previous: undefined,
      current,
      store,
      meta
    });

    if (store !== undefined) {
      store.insert(current);
    }
  }

  /**
   * Create an update operation and update an entity into the store
   * @param previous The entity before update
   * @param current The entity after update
   * @param store Optional: The store to update the entity into
   * @param meta Optional: Any metadata on the operation
   */
  private doUpdate(
    previous: object,
    current: object,
    store?: EntityStore<object>,
    meta?: { [key: string]: any }
  ) {
    this.addOperation({
      key: this.getKey(current),
      type: EntityOperationType.Update,
      previous,
      current,
      store,
      meta
    });

    if (store !== undefined) {
      store.update(current);
    }
  }

  /**
   * Create a delete operation and delete an entity from the store
   * @param previous The entity before delete
   * @param store Optional: The store to delete the entity from
   * @param meta Optional: Any metadata on the operation
   */
  private doDelete(
    previous: object,
    store?: EntityStore<object>,
    meta?: { [key: string]: any }
  ) {
    this.addOperation({
      key: this.getKey(previous),
      type: EntityOperationType.Delete,
      previous,
      current: undefined,
      store,
      meta
    });

    if (store !== undefined) {
      store.delete(previous);
    }
  }

  /**
   * Remove committed operations from store
   * @param operations Commited operations
   * @todo Raise event and synchronize stores?
   */
  private resolveOperations(operations: EntityOperation[]) {
    this.operations.deleteMany(operations);
  }

  /**
   * On commit success, resolve commited operations and exit commit phase
   * @param operations Commited operations
   */
  private onCommitSuccess(operations: EntityOperation[]) {
    this.resolveOperations(operations);
    this.inCommitPhase$.next(false);
  }

  /**
   * On commit error, abort transaction
   * @param operations Commited operations
   */
  private onCommitError(operations: EntityOperation[]) {
    this.inCommitPhase$.next(false);
  }

  /**
   * Add an operation to the operations store
   * @param operation Operation to add
   */
  private addOperation(operation: EntityOperation) {
    this.checkInCommitPhase();

    this.operations.insert(operation);
    this.operations.state.update(operation, { added: true });
  }

  /**
   * Remove an operation from the operations store
   * @param operation Operation to remove
   */
  private removeOperation(operation: EntityOperation) {
    this.checkInCommitPhase();

    this.operations.delete(operation);
    this.operations.state.update(operation, { added: false });
  }

  /**
   * Get all the operations to commit
   * @returns Operations to commit
   */
  private getOperationsInCommit(): EntityOperation[] {
    return this.operations.stateView
      .manyBy(
        (value: { entity: EntityOperation; state: EntityOperationState }) => {
          return value.state.added === true;
        }
      )
      .map(
        (value: { entity: EntityOperation; state: EntityOperationState }) =>
          value.entity
      );
  }

  /**
   * Check if the transaction is in the commit phase and throw an error if it is
   */
  private checkInCommitPhase() {
    if (this.inCommitPhase === true) {
      throw new Error(
        'This transaction is in the commit phase. Cannot complete this operation.'
      );
    }
  }
}
