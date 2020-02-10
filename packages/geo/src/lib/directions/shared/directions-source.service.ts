import { DirectionsSource } from '../directions-sources/directions-source';

export class DirectionsSourceService {
  constructor(public sources: DirectionsSource[]) {}
}

export function directionsSourceServiceFactory(sources: DirectionsSource[]) {
  return new DirectionsSourceService(sources);
}

export function provideDirectionsSourceService() {
  return {
    provide: DirectionsSourceService,
    useFactory: directionsSourceServiceFactory,
    deps: [DirectionsSource]
  };
}
