import { RoutingSource } from '../routing-sources/routing-source';

export class RoutingSourceService {
  constructor(public sources: RoutingSource[]) {}
}

export function routingSourceServiceFactory(sources: RoutingSource[]) {
  return new RoutingSourceService(sources);
}

export function provideRoutingSourceService() {
  return {
    provide: RoutingSourceService,
    useFactory: routingSourceServiceFactory,
    deps: [RoutingSource]
  };
}
