import {
  HttpClient,
  HttpErrorResponse,
  HttpParams
} from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

import { ConfigService } from '@igo2/core/config';
import { ObjectUtils } from '@igo2/utils';

import { Observable, catchError, map, throwError } from 'rxjs';

import {
  AnyChoiceEntityField,
  EntityRelation,
  EntityRelationParam,
  EntityState,
  SelectEntityTableColumn,
  SelectOption
} from './entity.interfaces';
import { isChoiceField } from './entity.utils';

@Injectable({
  providedIn: 'root'
})
export class EntityService {
  private http = inject(HttpClient);
  private configService = inject(ConfigService);

  encodeListValue(
    state: EntityState,
    column: SelectEntityTableColumn
  ): EntityState | string {
    if (column.arrayIdentifier) {
      const arrayStringify = JSON.stringify(
        ObjectUtils.resolve(state, column.name)
      );
      return `${column.arrayIdentifier[0]}${arrayStringify.slice(1, -1)}${
        column.arrayIdentifier[1]
      }`;
    }
    return ObjectUtils.resolve(state, column.name);
  }

  getDomainValues(
    field: AnyChoiceEntityField,
    paramsValue?: { [key: string]: unknown }
  ): Observable<SelectOption[]> {
    const relation = field.relation;
    if (!relation) {
      throw new Error(
        `Relation not defined for the field "${field.name}" (type: ${field.type}).`
      );
    }

    const url = this.buildUrl(field);
    if (!url)
      throw new Error(
        `Url not defined for the entity "${field.name}" (type: ${field.type}).`
      );

    const options: { params?: HttpParams } = {};
    if (relation.params && paramsValue) {
      const parsedParams = {};
      Object.keys(paramsValue).forEach((field) => {
        const key = this.getRelationFilterParamName(field, relation);
        parsedParams[key] = paramsValue[field];
      });

      options['params'] = new HttpParams().appendAll(parsedParams);
    }

    return this.http.get<SelectOption[]>(url, options).pipe(
      map((result) => this.parseDomainValues(relation, result)),
      catchError((err: HttpErrorResponse) => {
        err.error.caught = true;
        return throwError(() => err);
      })
    );
  }

  resolveDomainValues(
    state: EntityState,
    column: SelectEntityTableColumn
  ): unknown | unknown[] {
    let value = ObjectUtils.resolve(state, column.name);

    if (isChoiceField(column) && column.arrayIdentifier) {
      value = this.parseListValue(state, column);
    }

    if (Array.isArray(value)) {
      return value.map(
        (val) => this.findDomainValue(column, String(val))?.value
      );
    }

    return this.findDomainValue(column, String(value))?.value;
  }

  private buildUrl(field: AnyChoiceEntityField): string | undefined {
    const relation = field.relation;
    if (relation.url) return relation.url;
    const baseUrl = this.configService.getConfig<string | undefined>(
      'edition.url'
    );
    if (!relation.table) {
      return;
    }
    return baseUrl ? baseUrl + relation.table : relation.table;
  }

  private parseDomainValues(
    relation: EntityRelation,
    options: SelectOption[]
  ): SelectOption[] {
    const path = relation.choiceList?.path;

    const items = path?.list
      ? ObjectUtils.resolve(options, path.list)
      : options;

    return items.map((item) => {
      const id = path?.id ? ObjectUtils.resolve(item, path.id) : item.id;
      const value = path?.value
        ? ObjectUtils.resolve(item, path.value)
        : item.value;
      return { id, value } satisfies SelectOption;
    });
  }

  private getRelationFilterParamName(
    field: string,
    relation: EntityRelation
  ): string {
    const param: EntityRelationParam = relation.params;
    if (param.field !== field) {
      return field;
    }
    return param?.name ?? field;
  }

  private findDomainValue(
    column: SelectEntityTableColumn,
    id: string | number
  ): SelectOption {
    return column.domainValues?.find(
      (option) => String(option.id) === String(id)
    );
  }

  private parseListValue(
    state: EntityState,
    column: SelectEntityTableColumn
  ): unknown[] {
    let value = String(ObjectUtils.resolve(state, column.name)).trim();
    if (column.arrayIdentifier) {
      const [open, close] = column.arrayIdentifier;
      if (value.startsWith(open) && value.endsWith(close)) {
        value = value.slice(open.length, value.length - close.length);
      }
    }

    return value?.split(',').map((v) => v.trim()) ?? [];
  }
}
