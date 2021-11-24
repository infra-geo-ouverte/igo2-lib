import { OnInit, HostBinding, Input, ElementRef, Self, Optional, OnDestroy, Directive } from '@angular/core';
import { FormControl, NgControl, NgForm, FormControlName, ControlValueAccessor } from '@angular/forms';
import { MatFormFieldControl } from '@angular/material/form-field';
import { ErrorStateMatcher } from '@angular/material/core';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { FocusMonitor } from '@angular/cdk/a11y';
import { Subject } from 'rxjs';

/**
 * Classe de base pour la création de contrôles de formulaire qui s'intègrent avec les
 * formulaires dynamiques et Material
 */
@Directive()
export abstract class CustomFormControlDirective<T> implements OnInit, OnDestroy, ControlValueAccessor,
  MatFormFieldControl<T> {

  // ID of an element that we want the <mat-form-field> to associate all of its labels and hints with
  static nextId = 0;

  @Input() selector = '';

  @HostBinding() id = `${this.selector}-${CustomFormControlDirective.nextId++}`;

  stateChanges = new Subject<void>(); // Lets the <mat-form-field> know when change detection may be required
  focused = false;
  controlType = this.selector; // <mat-form-field> will add an additional class based on this (allows styling)
  control: FormControl;

  // Used by <mat-form-field> to specify the IDs that should be used for the aria-describedby
  @HostBinding('attr.aria-describedby') describedBy = '';

  // Indicates whether the form field control is empty
  get empty() {
    return this.isEmpty();
  }

  // Indicates whether the label should be in the floating position
  @HostBinding('class.floating')
  get shouldLabelFloat() {
    return this.focused || !this.empty;
  }

    // Tells the <mat-form-field> what to use as a placeholder (user specified via @Input())
  @Input()
  get placeholder(): string { return this._placeholder; }
  set placeholder(value: string) {
    this._placeholder = value;
    this.stateChanges.next();
  }
  private _placeholder: string;

  // Indicate whether the input is required (<mat-form-field> adds a required indicator to the placeholder)
  @Input()
  get required(): boolean { return this._required; }
  set required(value: boolean) {
    this._required = coerceBooleanProperty(value);
    this.stateChanges.next();
  }
  private _required = false;

  private _disabled = false;
  // Tells the form field when it should be in the disabled state
  @Input()
  get disabled(): boolean { return this._disabled; }
  set disabled(value: boolean) {
    // We need to set the disabled state on the individual inputs that make up our component
    this._disabled = coerceBooleanProperty(value);
    this._disabled ? this.disable() : this.enable();
    this.stateChanges.next();
  }

  // Allows to set or get the value of our control
  @Input()
  get value(): T | null {
    return this.getValue();
  }
  set value(value: T | null) {
    this.setValue(value);
    this.stateChanges.next();
  }

  @Input() errorStateMatcher: ErrorStateMatcher;

  // Indicates whether the associated NgControl is in an error state
  get errorState() {
    if (this.errorStateMatcher && this.control && this._parentForm) {
      return this.errorStateMatcher.isErrorState(this.control, this._parentForm);
    } else if (this._defaultErrorStateMatcher && this.control && this._parentForm) {
      return this._defaultErrorStateMatcher.isErrorState(this.control, this._parentForm);
    } else {
      return this.ngControl.errors !== null && this.ngControl.touched;
    }
  }

  constructor(
    protected _focusMonitor: FocusMonitor,
    protected _elementRef: ElementRef<HTMLElement>,
    @Optional() @Self() public ngControl: NgControl,
    @Optional() protected _parentForm: NgForm,
    @Optional() protected _controlName: FormControlName,
    protected _defaultErrorStateMatcher: ErrorStateMatcher
  ) {
    _focusMonitor.monitor(_elementRef, true).subscribe(origin => {
      if (this.focused && !origin) {
        this.onTouched();
      }
      this.focused = !!origin;
      this.stateChanges.next();
    });

    // Replace the provider from above with this
    if (this.ngControl !== null) {
      // Setting the value accessor directly (instead of using
      // the providers) to avoid running into a circular import.
      this.ngControl.valueAccessor = this;
    }
  }

  ngOnInit() {
    this.control = this._controlName.control;
  }

  onChange = (_: any) => {};
  onTouched = () => {};

  ngOnDestroy() {
    this.stateChanges.complete();
    this._focusMonitor.stopMonitoring(this._elementRef);
  }

  setDescribedByIds(ids: string[]) {
    // Apply the given IDs to our host element
    this.describedBy = ids.join(' ');
  }

  /**
   * Quand l'utilisateur clique sur l'élément, faire le focus sur le premier input
   * du formulaire (par défaut)
   */
  onContainerClick(event: MouseEvent) {
    // Called when the form field is clicked on
    if ((event.target as Element).tagName.toLowerCase() === 'input') {
      return;
    }

    const element = this._elementRef.nativeElement.querySelector('input');

    if (!element) {
      return;
    }

    element.focus();
  }

  writeValue(value: T | null): void {
    this.value = value;
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  change($event) {
    this.onChange($event.target.textContent);
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  /**
   * Indique si le formulaire est considéré vide
   */
  protected abstract isEmpty(): boolean;

  /**
   * Active les contrôles du formulaire
   */
  protected abstract enable(): void;

  /**
   * Indique si le contrôle est considéré vide
   */
  protected abstract disable(): void;

  /**
   * Obtient la valeur du formulaire
   */
  protected abstract getValue(): T;

  /**
   * Définit la valeur du formulaire
   */
  protected abstract setValue(value: T): void;
}
