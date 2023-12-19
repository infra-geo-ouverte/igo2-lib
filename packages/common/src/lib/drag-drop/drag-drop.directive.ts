import {
  Directive,
  EventEmitter,
  HostBinding,
  HostListener,
  Input,
  Output
} from '@angular/core';

@Directive({
  selector: '[igoDragAndDrop]'
})
export class DragAndDropDirective {
  @Input() allowedExtensions: Array<string> = [];

  @Output() protected filesDropped: EventEmitter<File[]> = new EventEmitter();

  @Output() protected filesInvalid: EventEmitter<File[]> = new EventEmitter();

  @HostBinding('style.background') private background = 'inherit';

  @HostListener('dragover', ['$event'])
  public onDragOver(evt) {
    evt.preventDefault();
    evt.stopPropagation();
    this.background = '#999';
  }

  @HostListener('dragleave', ['$event'])
  public onDragLeave(evt) {
    evt.preventDefault();
    evt.stopPropagation();
    this.background = 'inherit';
  }

  @HostListener('drop', ['$event'])
  public onDrop(evt) {
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

  private validExtensions(evt) {
    const files = evt.dataTransfer.files;
    const filesObj = {
      valid: [],
      invalid: []
    };
    if (files.length > 0) {
      for (const file of files) {
        const ext = file.name.split('.')[file.name.split('.').length - 1];
        if (
          this.allowedExtensions.length === 0 ||
          (this.allowedExtensions.lastIndexOf(ext) !== -1 && file.size !== 0)
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
