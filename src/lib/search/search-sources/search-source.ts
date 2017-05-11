import { Observable } from 'rxjs/Observable';

import { Message } from '../../core/message';
import { Feature } from '../../feature';



export abstract class SearchSource {

  abstract getName(): string;

  abstract search(term?: string): Observable<Feature[] | Message[]>

}
