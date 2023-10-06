import {
  HttpClient,
  HttpErrorResponse,
  HttpParams
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ConfigService } from '@igo2/core';
import { Observable, catchError, map, throwError } from 'rxjs';
import {
  EntityRelation,
  EntityRelationParam,
  SelectOption
} from './entity.interfaces';
import { ObjectUtils } from '@igo2/utils';

@Injectable({
  providedIn: 'root'
})
export class EntityService {
  constructor(
    private http: HttpClient,
    private configService: ConfigService
  ) {}

  getDomainValues(
    relation: EntityRelation,
    paramsValue?: { [key: string]: any }
  ): Observable<SelectOption[]> {
    let url = relation.url;
    if (!url) {
      url = this.configService.getConfig('edition.url')
        ? this.configService.getConfig('edition.url') + relation.table
        : relation.table;
    }

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

  private parseDomainValues(
    relation: EntityRelation,
    results: any
  ): SelectOption[] {
    const propertyGetter = relation.choiceList?.propertyGetter;

    const items = propertyGetter?.list
      ? ObjectUtils.resolve(results, propertyGetter.list)
      : results;

    return items.map((item) => {
      const id = propertyGetter?.id
        ? ObjectUtils.resolve(item, propertyGetter.id)
        : item.id;
      const value = propertyGetter?.value
        ? ObjectUtils.resolve(item, propertyGetter.value)
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
}
