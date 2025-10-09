import { Injectable, inject } from '@angular/core';
import { Validators } from '@angular/forms';

import { FormDialogFormConfig, FormDialogService } from '@igo2/common/form';

import { Observable, map, of, switchMap } from 'rxjs';

import { LayerService } from '../shared/layer.service';
import { LayerGroup } from '../shared/layers/layer-group';

const FORM_GROUP_CONFIG: FormDialogFormConfig = {
  formFieldConfigs: [
    {
      name: 'name',
      title: 'igo.geo.layer.group.name',
      type: 'text',
      options: {
        validator: Validators.required,
        errors: { required: 'igo.common.form.errors.required' }
      }
    }
  ]
};

@Injectable()
export class LayerListToolService {
  private layerService = inject(LayerService);
  private formDialogService = inject(FormDialogService);

  createGroup(): Observable<LayerGroup | undefined> {
    return this.formDialogService
      .open(FORM_GROUP_CONFIG, {
        title: 'igo.geo.layer.group.create',
        minWidth: '25%'
      })
      .pipe(
        switchMap((result) => {
          return result
            ? this.layerService.createAsyncGroup({
                type: 'group',
                title: result.name
              })
            : of(undefined);
        })
      );
  }

  renameGroup(group: LayerGroup): Observable<string | undefined> {
    const config = { ...FORM_GROUP_CONFIG };
    const field = config.formFieldConfigs.find(
      (field) => field.name === 'name'
    );
    field.options.initialValue = group.title;

    return this.formDialogService
      .open(config, {
        title: 'igo.geo.layer.group.rename',
        minWidth: '25%'
      })
      .pipe(map((result) => result?.name));
  }
}
