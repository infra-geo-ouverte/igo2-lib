import { Observable } from 'rxjs/Observable';

import { Message } from '../../core/message';
import { Routing } from '../shared';



export abstract class RoutingSource {

  abstract enabled: boolean;

  abstract getName(): string;

  abstract route(coordinates: [number, number][]): Observable<Routing[] | Message[]>

}
