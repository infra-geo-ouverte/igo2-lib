import { Component, Input, Output, EventEmitter, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

import {
  Context,
  ContextPermission,
  ContextPermissionsList
} from '../shared/context.interface';

@Component({
  selector: 'igo-context-permissions',
  templateUrl: './context-permissions.component.html',
  styleUrls: ['./context-permissions.component.scss']
})
export class ContextPermissionsComponent implements OnInit {
  public form: FormGroup;

  @Input()
  get context(): Context {
    return this._context;
  }
  set context(value: Context) {
    this._context = value;
    this.cd.detectChanges();
  }
  private _context: Context;

  @Input()
  get permissions(): ContextPermissionsList {
    return this._permissions;
  }
  set permissions(value: ContextPermissionsList) {
    this._permissions = value;
    this.cd.detectChanges();
  }
  private _permissions: ContextPermissionsList;

  @Output() addPermission: EventEmitter<ContextPermission> = new EventEmitter();
  @Output() removePermission: EventEmitter<ContextPermission> = new EventEmitter();
  @Output() scopeChanged: EventEmitter<Context> = new EventEmitter();

  constructor(private formBuilder: FormBuilder,
              private cd: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.buildForm();
  }

  public handleFormSubmit(value) {
    this.addPermission.emit(value);
  }

  private buildForm(): void {
    this.form = this.formBuilder.group({
      profil: [],
      typePermission: ['read']
    });
  }
}
