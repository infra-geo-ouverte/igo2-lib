import {
  Directive,
  HostBinding,
  HostListener,
  input,
  output
} from '@angular/core';

@Directive({
  selector: '[igoDragAndDrop]'
})
export class DragAndDropDirective {
  readonly allowedExtensions = input<string[]>([]);

  protected readonly filesDropped = output<File[]>();

  protected readonly filesInvalid = output<File[]>();

  @HostBinding('style.background') background = 'inherit';

  @HostListener('dragover', ['$event'])
  public onDragOver(evt: DragEvent) {
    evt.preventDefault();
    evt.stopPropagation();
    this.background = '#999';
  }

  @HostListener('dragleave', ['$event'])
  public onDragLeave(evt: DragEvent) {
    evt.preventDefault();
    evt.stopPropagation();
    this.background = 'inherit';
  }

  @HostListener('drop', ['$event'])
  public onDrop(evt: DragEvent & { alreadyFired?: boolean }) {
    evt.preventDefault();
    evt.stopPropagation();
    if (evt.alreadyFired) {
      return;
    }
    evt.alreadyFired = true;

    this.background = 'inherit';
    const filesObj = this.validExtensions(evt);
    if (filesObj.valid.length) {
      this.filesDropped.emit(filesObj.valid);
    }
    if (filesObj.invalid.length) {
      this.filesInvalid.emit(filesObj.invalid);
    }
  }

  private validExtensions(evt: DragEvent) {
    const files = evt.dataTransfer?.files;
    const filesObj: { valid: File[]; invalid: File[] } = {
      valid: [],
      invalid: []
    };
    if (files && files.length > 0) {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const ext = file.name.split('.')[file.name.split('.').length - 1];
        const allowedExtensions = this.allowedExtensions();
        if (
          allowedExtensions.length === 0 ||
          (allowedExtensions.lastIndexOf(ext) !== -1 && file.size !== 0)
        ) {
          filesObj.valid.push(file);
        } else {
          filesObj.invalid.push(file);
        }
      }
    }

    return filesObj;
  }
}
