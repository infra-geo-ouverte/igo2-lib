import { Component, Input, Output, EventEmitter } from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  FormControl,
  Validators
} from '@angular/forms';

import { PrintOptions } from '../shared/print.interface';

import {
  PrintFormat,
  PrintOrientation,
  PrintResolution
} from '../shared/print.type';

@Component({
  selector: 'igo-print-form',
  templateUrl: './print-form.component.html',
  styleUrls: ['./print-form.component.scss']
})
export class PrintFormComponent {
  public form: FormGroup;
  public submitted: boolean;

  public formats = PrintFormat;
  public orientations = PrintOrientation;
  public resolutions = PrintResolution;

  @Input()
  get disabled(): boolean {
    return this._disabled;
  }
  set disabled(value: boolean) {
    this._disabled = value;
  }
  private _disabled = false;

  @Input()
  get format(): PrintFormat {
    return this.formatField.value;
  }
  set format(value: PrintFormat) {
    this.formatField.setValue(value || PrintFormat.Letter, {
      onlySelf: true
    });
  }

  @Input()
  get orientation(): PrintOrientation {
    return this.orientationField.value;
  }
  set orientation(value: PrintOrientation) {
    this.orientationField.setValue(value || PrintOrientation.landscape, {
      onlySelf: true
    });
  }

  @Input()
  get resolution(): PrintResolution {
    return this.resolutionField.value;
  }
  set resolution(value: PrintResolution) {
    this.resolutionField.setValue(value || PrintResolution['96'], {
      onlySelf: true
    });
  }

  @Input()
  get title(): string {
    return this.titleField.value;
  }
  set title(value: string) {
    this.titleField.setValue(value, { onlySelf: true });
  }

  get formatField() {
    return <FormControl>this.form.controls['format'];
  }

  get orientationField() {
    return <FormControl>this.form.controls['orientation'];
  }

  get resolutionField() {
    return <FormControl>this.form.controls['resolution'];
  }

  get titleField() {
    return <FormControl>this.form.controls['title'];
  }

  @Output() submit: EventEmitter<PrintOptions> = new EventEmitter();

  constructor(private formBuilder: FormBuilder) {
    this.form = this.formBuilder.group({
      title: ['', []],
      format: ['', [Validators.required]],
      resolution: ['', [Validators.required]],
      orientation: ['', [Validators.required]]
    });
  }

  handleFormSubmit(data: PrintOptions, isValid: boolean) {
    this.submitted = true;
    if (isValid) {
      this.submit.emit(data);
    }
  }
}
