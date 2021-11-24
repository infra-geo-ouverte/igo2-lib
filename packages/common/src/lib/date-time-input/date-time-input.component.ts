import { Component, Input, ElementRef, Optional, Self, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, NgControl, NgForm, FormControlName } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { MatFormFieldControl } from '@angular/material/form-field';
import { FocusMonitor } from '@angular/cdk/a11y';
import * as moment from 'moment';

import { CustomFormControlDirective } from '../custom-form-control/custom-form-control.directive';

/**
 * Contrôle de formulaire permettant la saisie d'une date et d'une heure
 */
@Component({
  selector: 'igo-date-time-input',
  templateUrl: './date-time-input.component.html',
  styleUrls: ['./date-time-input.component.scss'],
  providers: [{ provide: MatFormFieldControl, useExisting: DateTimeInputComponent }]
})
export class DateTimeInputComponent extends CustomFormControlDirective<moment.Moment> implements OnInit {

  @Input() maxDate: moment.Moment; // Date maximale du calendrier

  parts: FormGroup;

  @ViewChild('timeInput') timeInput: ElementRef;

  constructor(
    formBuilder: FormBuilder,
    protected _focusMonitor: FocusMonitor,
    protected _elementRef: ElementRef<HTMLElement>,
    @Optional() @Self() public ngControl: NgControl,
    @Optional() protected _parentForm: NgForm,
    @Optional() protected _controlName: FormControlName,
    protected _defaultErrorStateMatcher: ErrorStateMatcher) {

    super(_focusMonitor, _elementRef, ngControl, _parentForm, _controlName, _defaultErrorStateMatcher);

    this.parts = formBuilder.group({
      date: '',
      time: ''
    });
  }

  /**
   * Déclencher la détection de changement et retourner la nouvelle valeur
   */
  _handleInput(): void {
    this.onChange(this.getValue());
  }

  /**
   * Empêche l'ouverture et la fermeture du calendrier de déclencher le focus ou la
   * validation du contrôle
   */
  _handleToggleCalendar($event: MouseEvent): void {
    $event.preventDefault();
  }

  /**
   * Quand l'utilisateur ferme le calendrier du date-picker, faire le focus
   * sur le champ input de la date
   */
  _handleCloseCalendar(picker: any) {
    this._elementRef.nativeElement.querySelector('input').focus();
  }

  /**
   * Indique si le formulaire est considéré vide
   */
  protected isEmpty(): boolean {

    const formValues = this.parts.value;
    const dateValue = formValues.date ? true : false;
    const timeValue = formValues.time ? true : false;

    const inputUndefined = !this.timeInput || !(this.timeInput?.nativeElement as HTMLInputElement);
    return inputUndefined || (
      !dateValue && !timeValue && (this.timeInput.nativeElement as HTMLInputElement).validity.valid);
  }

  /**
   * Active les contrôles du formulaire
   */
  protected enable() {
    this.parts.enable();
  }

  /**
   * Désactive les contrôles du formulaire
   */
  protected disable() {
    this.parts.disable();
  }

  /**
   * Obtient la valeur du formulaire (date et heure)
   */
  protected getValue(): moment.Moment {

    if (this.timeInput && this.timeInput.nativeElement.validity.valid) {

      const formValues = this.parts.value;
      const date = formValues.date ? formValues.date : null;
      const hours = formValues.time ? formValues.time.split(':')[0] : null;
      const minutes = formValues.time ? formValues.time.split(':')[1] : null;

      if (date && hours && minutes) {
        const momentDate: moment.Moment = this.parts.value.date; // Conversion avec moment pour IE11 et Firefox

        momentDate.set({hour: +hours, minute: +minutes});

        return momentDate;
      } else {
        return null;
      }
    } else {
      return undefined;
    }
  }

  /**
   * Définit la valeur du formulaire (date et heure)
   */
  protected setValue(value: moment.Moment) {

    if (value) {
      this.parts.setValue({ date: value, time: value.format('HH:mm') }, { emitEvent: false });
    } else {
      this.parts.setValue({ date: null, time: null }, { emitEvent: false });
    }
  }
}
