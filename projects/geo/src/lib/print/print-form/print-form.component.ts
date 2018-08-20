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
  PrintResolution,
  PrintSaveImageFormat
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
  public imageFormats = PrintSaveImageFormat;
  public isPrintService = true;

  @Input()
  get disabled(): boolean {
    return this._disabled;
  }
  set disabled(value: boolean) {
    this._disabled = value;
  }
  private _disabled = false;

  @Input()
  get imageFormat(): PrintSaveImageFormat {
    return this.imageFormatField.value;
  }
  set imageFormat(value: PrintSaveImageFormat) {
    this.imageFormatField.setValue(value || PrintSaveImageFormat.Jpeg, {
      onlySelf: true
    });
  }

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

  @Input()
  get comment(): string {
    return this.commentField.value;
  }
  set comment(value: string) {
    this.commentField.setValue(value, { onlySelf: true });
  }
  @Input()
  get showProjection(): boolean {
    return this.showProjectionField.value;
  }
  set showProjection(value: boolean) {
    this.showProjectionField.setValue(value, { onlySelf: true });
  }
  @Input()
  get showScale(): boolean {
    return this.showScaleField.value;
  }
  set showScale(value: boolean) {
    this.showScaleField.setValue(value, { onlySelf: true });
  }
  @Input()
  get showLegend(): boolean {
    return this.showLegendField.value;
  }
  set showLegend(value: boolean) {
    this.showLegendField.setValue(value, { onlySelf: true });
  }

  get formatField() {
    return <FormControl>this.form.controls['format'];
  }

  get imageFormatField() {
    return <FormControl>this.form.controls['imageFormat'];
  }

  get orientationField() {
    return <FormControl>this.form.controls['orientation'];
  }

  get resolutionField() {
    return <FormControl>this.form.controls['resolution'];
  }

  get commentField() {
    return <FormControl>this.form.controls['comment'];
  }
  get showProjectionField() {
    return <FormControl>this.form.controls['showProjection'];
  }
  get showScaleField() {
    return <FormControl>this.form.controls['showScale'];
  }
  get showLegendField() {
    return <FormControl>this.form.controls['showLegend'];
  }

  get titleField() {
    return <FormControl>this.form.controls['title'];
  }

  @Output() submit: EventEmitter<PrintOptions> = new EventEmitter();

  constructor(private formBuilder: FormBuilder) {
    this.form = this.formBuilder.group({
      title: ['', []],
      comment: ['', []],
      format: ['', [Validators.required]],
      imageFormat: [
        { value: '', disabled: this.isPrintService },
        [Validators.required]
      ],
      resolution: ['', [Validators.required]],
      orientation: ['', [Validators.required]],
      showProjection: false,
      showScale: false,
      showLegend: false
    });
  }

  handleFormSubmit(data: PrintOptions, isValid: boolean) {
    this.submitted = true;
    data['isPrintService'] = this.isPrintService;
    if (isValid) {
      this.submit.emit(data);
    }
  }

  toggleImageSaveProp() {
    if (this.formatField.value === 'Image') {
      this.imageFormatField.enable();
      this.isPrintService = false;
      this.form.controls.imageFormat.enable();
    } else {
      this.imageFormatField.disable();
      this.isPrintService = true;
      this.form.controls.imageFormat.disable();
    }
  }
}
