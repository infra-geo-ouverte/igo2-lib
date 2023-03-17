import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import {
  UntypedFormGroup,
  UntypedFormBuilder,
  UntypedFormControl,
  Validators,
  AbstractControl
} from '@angular/forms';
import { BehaviorSubject } from 'rxjs';

import { PrintOptions } from '../shared/print.interface';

import {
  PrintOutputFormat,
  PrintPaperFormat,
  PrintOrientation,
  PrintResolution,
  PrintSaveImageFormat,
  PrintLegendPosition
} from '../shared/print.type';

@Component({
  selector: 'igo-print-form',
  templateUrl: './print-form.component.html',
  styleUrls: ['./print-form.component.scss']
})
export class PrintFormComponent implements OnInit {
  public form: UntypedFormGroup;
  public outputFormats = PrintOutputFormat;
  public paperFormats = PrintPaperFormat;
  public orientations = PrintOrientation;
  public resolutions = PrintResolution;
  public imageFormats = PrintSaveImageFormat;
  public legendPositions = PrintLegendPosition;
  public isPrintService = true;

  @Input() disabled$: BehaviorSubject<boolean>;

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
  get outputFormat(): PrintOutputFormat {
    return this.outputFormatField.value;
  }
  set outputFormat(value: PrintOutputFormat) {
    this.outputFormatField.setValue(value || PrintOutputFormat.Pdf, {
      onlySelf: true
    });
  }

  @Input()
  get paperFormat(): PrintPaperFormat {
    return this.paperFormatField.value;
  }
  set paperFormat(value: PrintPaperFormat) {
    this.paperFormatField.setValue(value || PrintPaperFormat.Letter, {
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
  get legendPosition(): PrintLegendPosition {
    return this.legendPositionField.value;
  }
  set legendPosition(value: PrintLegendPosition) {
    this.legendPositionField.setValue(value || PrintLegendPosition.none, {
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
  get subtitle(): string {
    return this.subtitleField.value;
  }
  set subtitle(value: string) {
    this.subtitleField.setValue(value, { onlySelf: true });
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

  @Input()
  get doZipFile(): boolean {
    return this.doZipFileField.value;
  }
  set doZipFile(value: boolean) {
    this.doZipFileField.setValue(value, { onlySelf: true });
  }

  get outputFormatField() {
    return (this.form.controls as any).outputFormat as UntypedFormControl;
  }

  get paperFormatField() {
    return (this.form.controls as any).paperFormat as UntypedFormControl;
  }

  get imageFormatField() {
    return (this.form.controls as any).imageFormat as UntypedFormControl;
  }

  get orientationField() {
    return (this.form.controls as any).orientation as UntypedFormControl;
  }

  get resolutionField() {
    return (this.form.controls as any).resolution as UntypedFormControl;
  }

  get commentField() {
    return (this.form.controls as any).comment as UntypedFormControl;
  }

  get showProjectionField() {
    return (this.form.controls as any).showProjection as UntypedFormControl;
  }

  get showScaleField() {
    return (this.form.controls as any).showScale as UntypedFormControl;
  }

  get showLegendField() {
    return (this.form.controls as any).showLegend as UntypedFormControl;
  }

  get doZipFileField() {
    return (this.form.controls as any).doZipFile as UntypedFormControl;
  }

  get titleField() {
    return (this.form.controls as any).title as UntypedFormControl;
  }

  get subtitleField() {
    return (this.form.controls as any).subtitle as UntypedFormControl;
  }

  get legendPositionField() {
    return (this.form.controls as any).legendPosition as UntypedFormControl;
  }

  @Output() submit: EventEmitter<PrintOptions> = new EventEmitter();

  maxLenth: number = 180;

  constructor(private formBuilder: UntypedFormBuilder) {
    this.form = this.formBuilder.group({
      title: ['', []],
      subtitle: ['', []],
      comment: ['', [Validators.minLength(0), Validators.maxLength(this.maxLenth)]],
      outputFormat: ['', [Validators.required]],
      paperFormat: ['', [Validators.required]],
      imageFormat: [ '', [Validators.required]],
      resolution: ['', [Validators.required]],
      orientation: ['', [Validators.required]],
      legendPosition: ['', [Validators.required]],
      showProjection: false,
      showScale: false,
      showLegend: false,
      doZipFile: [{hidden: this.isPrintService }]
    });
  }

  ngOnInit() {
    this.doZipFileField.setValue(false);
  }

  handleFormSubmit(data: PrintOptions, isValid: boolean) {
    data.isPrintService = this.isPrintService;
    if (isValid) {
      this.submit.emit(data);
    }
  }

  toggleImageSaveProp() {
    if (this.outputFormatField.value === 'Image') {
      this.isPrintService = false;
    } else {
      this.isPrintService = true;
    }
  }

  changeCommentLenth() {
    this.maxLenth = (this.orientation === PrintOrientation.landscape) ? 180 : 90;
    this.commentField.setValidators([Validators.maxLength(this.maxLenth)]​);
  }
}
