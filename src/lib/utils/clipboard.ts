import * as bowser from 'bowser';

export class Clipboard {
  static copy(element: HTMLTextAreaElement | string): boolean {
    let successful = false;
    if (typeof element === 'string') {
      const textArea = Clipboard.createTextArea(element);
      Clipboard.selectText(textArea);
      successful = Clipboard.copyTextToClipboard();
      Clipboard.destroyTextArea(textArea);
    } else {
      Clipboard.selectText(element);
      successful = Clipboard.copyTextToClipboard();
    }
    return successful;
  }

  private static createTextArea(text: string): HTMLTextAreaElement {
    const textArea = document.createElement('textArea') as HTMLTextAreaElement;
    textArea.value = text;
    document.body.appendChild(textArea);
    return textArea;
  }

  private static destroyTextArea(textArea) {
    document.body.removeChild(textArea);
  }

  private static selectText(textArea) {
    if (bowser.ios) {
      const oldContentEditable = textArea.contentEditable;
      const oldReadOnly = textArea.readOnly;
      const range = document.createRange();
      const selection = window.getSelection();

      textArea.contenteditable = true;
      textArea.readonly = false;
      range.selectNodeContents(textArea);
      selection.removeAllRanges();
      selection.addRange(range);
      textArea.setSelectionRange(0, 999999);
      textArea.contentEditable = oldContentEditable;
      textArea.readOnly = oldReadOnly;
    } else {
      textArea.select();
    }
  }

  private static copyTextToClipboard(): boolean {
    if (!(bowser.ios && bowser.version < 10)) {
      return document.execCommand('copy');
    }
    return false;
  }
}
