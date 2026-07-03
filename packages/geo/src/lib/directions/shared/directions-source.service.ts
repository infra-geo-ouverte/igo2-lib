import { inject } from '@angular/core';

import { ConfigService } from '@igo2/core/config';

import { DirectionsSource } from '../directions-sources/directions-source';

export class DirectionsSourceService {
  public activeSource: DirectionsSource;
  private configService = inject(ConfigService);

  constructor(public sources: DirectionsSource[]) {
    const preferredSourceId = this.configService.getConfig(
      'directionsSources.defaultSourceId'
    ) as string | undefined;

    this.activeSource = this.computeActiveSource(preferredSourceId);
  }

  setActiveSource(id: string): void {
    this.activeSource = this.computeActiveSource(id);
  }

  private computeActiveSource(id: string | undefined): DirectionsSource {
    if (!id) {
      return this.sources[0];
    } else {
      return (
        this.sources.find((source) => source.getSourceId() === id) ??
        this.sources[0]
      );
    }
  }
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
