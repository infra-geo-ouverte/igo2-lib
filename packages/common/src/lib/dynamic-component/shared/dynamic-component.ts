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
  private inputs: { [key: string]: any } = {};

  /**
   * Subscriptions to the component's async inputs
   */
  private inputs$$: { [key: string]: Subscription } = {};

  /**
   * Subscribers to the component's outputs
   */
  private subscribers: { [key: string]: (event: any) => void } = {};

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
  updateInputs(inputs: { [key: string]: any }) {
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
        if (inputs.hasOwnProperty(key)) {
          if (inputValue instanceof Observable) {
            this.observeInput(key, inputValue);
          } else {
            this.setInputValue(instance, key, inputValue);
          }
        }
      }
    );

    if (typeof (instance as any).onUpdateInputs === 'function') {
      (instance as any).onUpdateInputs();
    }
  }

  /**
   * Set an instance's input value
   * @param instance Component instance
   * @param key Input key
   * @param value Input value
   */
  private setInputValue(instance: C, key: string, value: any) {
    const currentValue = instance[key];
    if (value === currentValue) {
      return;
    }

    const prototype = Object.getPrototypeOf(instance);
    const descriptor = Object.getOwnPropertyDescriptor(prototype, key);
    if (descriptor !== undefined && descriptor.set !== undefined) {
      descriptor.set.call(instance, value);
    } else {
      instance[key] = value;
    }
  }

  /**
   * Update the component subscribers. This is an update so any
   * key not defined won't be overwritten.
   */
  updateSubscribers(subscribers: { [key: string]: (event: any) => void }) {
    this.subscribers = subscribers;
    if (this.componentRef === undefined) {
      return;
    }

    const instance = this.componentRef.instance;
    const allowedSubscribers = this.componentFactory.outputs;
    allowedSubscribers.forEach(
      (value: { propName: string; templateName: string }) => {
        const key = value.propName;
        if (subscribers.hasOwnProperty(key)) {
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
  private observeInput(key: string, observable: Observable<any>) {
    this.inputs$$[key] = observable.subscribe((value: any) => {
      const instance = this.componentRef.instance;
      this.setInputValue(instance, key, value);

      if (typeof (instance as any).onUpdateInputs === 'function') {
        (instance as any).onUpdateInputs();
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
