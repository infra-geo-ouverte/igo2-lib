import { Observable } from 'rxjs/Observable';

import { Feature } from '../../feature';



export abstract class SearchSource {

  abstract enabled: boolean;

  abstract getName(): string;

  abstract search(term?: string): Observable<Feature[]>

  abstract locate(coordinate: [number, number], zoom?: number): Observable<Feature[]>

}
