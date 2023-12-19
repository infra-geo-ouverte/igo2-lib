import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  ViewChild,
  ViewContainerRef
} from '@angular/core';

import { ObjectUtils } from '@igo2/utils';

import { DynamicComponent } from '../shared/dynamic-component';
import { DynamicComponentService } from '../shared/dynamic-component.service';

@Component({
    selector: 'igo-dynamic-outlet',
    templateUrl: 'dynamic-outlet.component.html',
    styleUrls: ['dynamic-outlet.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true
})
export class DynamicOutletComponent implements OnChanges, OnDestroy {
  /**
   * The dynamic component base class or the dynamic component itself
   */
  @Input() component: DynamicComponent<any> | any;

  /**
   * The dynamic component inputs
   */
  @Input() inputs: { [key: string]: any } = {};

  /**
   * The subscribers to the dynamic component outputs
   */
  @Input() subscribers: { [key: string]: (event: any) => void } = {};

  /**
   * The dynamic component
   */
  private dynamicComponent: DynamicComponent<any>;

  /**
   * The view element to render the component to
   * @ignore
   */
  @ViewChild('target', { read: ViewContainerRef, static: true })
  private target: ViewContainerRef;

  constructor(
    private dynamicComponentService: DynamicComponentService,
    private cdRef: ChangeDetectorRef
  ) {}

  /**
   * If the dynamic component changes, create it.
   * If the inputs or subscribers change, update the current component's
   * inputs or subscribers.
   * @internal
   */
  ngOnChanges(changes: SimpleChanges) {
    const component = changes.component;
    const inputs = changes.inputs;
    const subscribers = changes.subscribers;
    const eq = ObjectUtils.objectsAreEquivalent;

    if (!component || !component.currentValue) {
      return;
    }

    if (component.currentValue !== component.previousValue) {
      this.createComponent(component.currentValue);
    } else {
      const inputsAreEquivalents =
        inputs && eq(inputs.currentValue || {}, inputs.previousValue || {});
      const subscribersAreEquivalents =
        subscribers &&
        eq(subscribers.currentValue || {}, subscribers.previousValue || {});

      if (inputsAreEquivalents === false) {
        this.updateInputs();
      }

      if (subscribersAreEquivalents === false) {
        this.updateSubscribers();
      }
    }
    this.cdRef.detectChanges();
  }

  /**
   * Destroy the dynamic component and all it's subscribers
   * @internal
   */
  ngOnDestroy() {
    if (this.dynamicComponent) {
      this.dynamicComponent.destroy();
    }
  }

  /**
   * Create a  DynamicComponent out of the component class and render it.
   * @internal
   */
  private createComponent(component: DynamicComponent<any> | any) {
    if (this.dynamicComponent !== undefined) {
      this.dynamicComponent.destroy();
    }
    this.dynamicComponent =
      component instanceof DynamicComponent
        ? component
        : this.dynamicComponentService.create(component);
    this.renderComponent();
  }

  /**
   * Create and render the dynamic component. Set it's inputs and subscribers
   * @internal
   */
  private renderComponent() {
    this.updateInputs();
    this.updateSubscribers();
    this.dynamicComponent.setTarget(this.target);
  }

  /**
   * Update the dynamic component inputs. This is an update so any
   * key not defined won't be overwritten.
   * @internal
   */
  private updateInputs() {
    this.dynamicComponent.updateInputs(this.inputs);
  }

  /**
   * Update the dynamic component subscribers. This is an update so any
   * key not defined won't be overwritten.
   * @internal
   */
  private updateSubscribers() {
    this.dynamicComponent.updateSubscribers(this.subscribers);
  }
}
