import {
  ComponentFactory,
  ComponentRef,
  ViewContainerRef
} from '@angular/core';

import { Observable, Subscription } from 'rxjs';

/**
 * This class is used in the DynamicComponentOutlet component. It holds
 * a reference to a component factory and can render that component
 * in a target element on demand. It's also possible to set inputs
 * and to subscribe to outputs.
 */
export class DynamicComponent<C> {
  /**
   * Component reference
   */
  private componentRef: ComponentRef<C>;

  /**
   * Subscriptions to the component's outputs. Those need
   * to be unsubscribed when the component is destroyed.
   */
  private subscriptions: Subscription[] = [];

  /**
   * Component target element
   */
  private target: ViewContainerRef;

  /**
   * Component inputs
   */
  private inputs: Record<string, unknown> = {};

  /**
   * Subscriptions to the component's async inputs
   */
  private inputs$$: Record<string, Subscription> = {};

  /**
   * Subscribers to the component's outputs
   */
  private subscribers: Record<string, (event: unknown) => void> = {};

  constructor(private componentFactory: ComponentFactory<C>) {}

  /**
   * Render the component to a target element.
   * Set it's inputs and subscribe to it's outputs.
   * @param target Target element
   */
  setTarget(target: ViewContainerRef) {
    this.target = target;
    this.componentRef = target.createComponent(this.componentFactory);
    this.updateInputs(this.inputs);
    this.updateSubscribers(this.subscribers);
  }

  /**
   * Destroy this component. That means, removing from it's target
   * element and unsubscribing to it's outputs.
   */
  destroy() {
    if (this.target !== undefined) {
      this.target.clear();
    }
    if (this.componentRef !== undefined) {
      this.componentRef.destroy();
      this.componentRef = undefined;
    }
    this.unobserveAllInputs();
    this.unsubscribeAll();
  }

  /**
   * Update the component inputs. This is an update so any
   * key not defined won't be overwritten.
   */
  updateInputs(inputs: Record<string, unknown>) {
    this.inputs = inputs;
    if (this.componentRef === undefined) {
      return;
    }

    const instance = this.componentRef.instance;
    const allowedInputs = this.componentFactory.inputs;
    allowedInputs.forEach(
      (value: { propName: string; templateName: string }) => {
        const key = value.propName;

        this.unobserveInput(key);

        const inputValue = inputs[key];
        if (Object.prototype.hasOwnProperty.call(inputs, key)) {
          if (inputValue instanceof Observable) {
            this.observeInput(key, inputValue);
          } else {
            this.setInputValue(key, inputValue);
          }
        }
      }
    );

    const instWithHook = instance as { onUpdateInputs?: unknown };
    if (typeof instWithHook.onUpdateInputs === 'function') {
      (instWithHook.onUpdateInputs as () => void)();
    }
  }

  /**
   * Set an instance's input value
   * @param instance Component instance
   * @param key Input key
   * @param value Input value
   */
  private setInputValue(key: string, value: unknown) {
    this.componentRef.setInput(key, value);
  }

  /**
   * Update the component subscribers. This is an update so any
   * key not defined won't be overwritten.
   */
  updateSubscribers(subscribers: Record<string, (event: unknown) => void>) {
    this.subscribers = subscribers;
    if (this.componentRef === undefined) {
      return;
    }

    const instance = this.componentRef.instance;
    const allowedSubscribers = this.componentFactory.outputs;
    allowedSubscribers.forEach(
      (value: { propName: string; templateName: string }) => {
        const key = value.propName;
        if (Object.prototype.hasOwnProperty.call(subscribers, key)) {
          const emitter = instance[key];
          const subscriber = subscribers[key];
          if (Array.isArray(subscriber)) {
            subscriber.forEach((_subscriber) => {
              this.subscriptions.push(emitter.subscribe(_subscriber));
            });
          } else {
            this.subscriptions.push(emitter.subscribe(subscriber));
          }
        }
      }
    );
  }

  /**
   * Subscribe to an observable input and update the component's input value
   * accordingly
   * @param key Input key
   * @param observable Observable
   */
  private observeInput(key: string, observable: Observable<unknown>) {
    this.inputs$$[key] = observable.subscribe((value: unknown) => {
      const instance = this.componentRef.instance;
      this.setInputValue(key, value);

      const instWithHook = instance as { onUpdateInputs?: unknown };
      if (typeof instWithHook.onUpdateInputs === 'function') {
        (instWithHook.onUpdateInputs as () => void)();
      }
    });
  }

  /**
   * Unsubscribe to an observable input
   * @param key Input key
   */
  private unobserveInput(key: string) {
    if (this.inputs$$[key] !== undefined) {
      this.inputs$$[key].unsubscribe();
      this.inputs$$[key] = undefined;
    }
  }

  /**
   * Unsubscribe to all outputs.
   */
  private unobserveAllInputs() {
    Object.values(this.inputs$$).forEach((s: Subscription | undefined) => {
      if (s !== undefined) {
        s.unsubscribe();
      }
    });
    this.inputs$$ = {};
  }

  /**
   * Unsubscribe to all outputs.
   */
  private unsubscribeAll() {
    this.subscriptions.forEach((s: Subscription) => s.unsubscribe());
    this.subscriptions = [];
  }
}
