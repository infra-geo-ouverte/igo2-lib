import { BehaviorSubject } from 'rxjs';

export class TableDatabase {
  /** Stream that emits whenever the data has been modified. */
  dataChange: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
  get data(): any[] {
    return this.dataChange.value;
  }

  constructor(data?) {
    if (data) {
      this.dataChange.next(data);
    }
  }

  set(data) {
    this.dataChange.next(data);
  }

  add(item) {
    const copiedData = this.data.slice();
    copiedData.push(item);
    this.set(copiedData);
  }

  remove(item) {
    const copiedData = this.data.slice();
    const index = copiedData.indexOf(item);
    copiedData.splice(index, 1);
    this.set(copiedData);
  }
}
