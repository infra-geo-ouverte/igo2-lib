import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';

import { PrintOptions, PrintFormat, PrintOrientation,
         PrintResolution } from '../shared';

@Component({
  selector: 'igo-print-form',
  templateUrl: './print-form.component.html',
  styleUrls: ['./print-form.component.styl']
})
export class PrintFormComponent {

  public form: FormGroup;
  public submitted: boolean;

  public formats = PrintFormat;
  public orientations = PrintOrientation;
  public resolutions = PrintResolution;

  @Input()
  get format(): PrintFormat { return this.formatField.value; }
  set format(value: PrintFormat) {
    this.formatField.setValue(value || PrintFormat.A4, {
      onlySelf: true
    });
  }

  @Input()
  get orientation(): PrintOrientation { return this.orientationField.value; }
  set orientation(value: PrintOrientation) {
    this.orientationField.setValue(value || PrintOrientation.landscape, {
      onlySelf: true
    });
  }

  @Input()
  get resolution(): PrintResolution { return this.resolutionField.value; }
  set resolution(value: PrintResolution) {
    this.resolutionField.setValue(value || PrintResolution['72'], {
      onlySelf: true
    });
  }

  get formatField () {
    return (<FormControl>this.form.controls['format']);
  }

  get orientationField () {
    return (<FormControl>this.form.controls['orientation']);
  }

  get resolutionField () {
    return (<FormControl>this.form.controls['resolution']);
  }

  @Output() submit: EventEmitter<PrintOptions> = new EventEmitter();

  constructor(private formBuilder: FormBuilder) {
    this.form = this.formBuilder.group({
      format: ['', [
        Validators.required
      ]],
      resolution: ['', [
        Validators.required
      ]],
      orientation: ['', [
        Validators.required
      ]]
    });
  }

  handleFormSubmit(data: PrintOptions, isValid: boolean) {
    this.submitted = true;
    if (isValid) {
      this.submit.emit(data);
    }
  }
}
