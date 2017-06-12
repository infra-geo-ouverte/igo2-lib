import { Injectable } from '@angular/core';
import { Http, URLSearchParams, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';

import { RequestService } from '../../core';
import { ObjectUtils } from '../../utils';

import { WMTSDataSourceOptions, WMSDataSourceOptions } from './datasources';

@Injectable()
export class CapabilitiesService {

  private capabilitiesStore: any[] = [];
  private parsers = {
    'wms': new ol.format.WMSCapabilities(),
    'wmts': new ol.format.WMTSCapabilities()
  };

  constructor(private http: Http,
              private requestService: RequestService) { }

  getWMSOptions(baseOptions: WMSDataSourceOptions):
      Observable<WMSDataSourceOptions> {

    const url = baseOptions.url;
    const version = (baseOptions.params as any).version;

    return this.getCapabilities('wms', url, version)
      .map((capabilities: any) =>
        this.parseWMSOptions(baseOptions, capabilities));
  }

  getWMTSOptions(baseOptions: WMTSDataSourceOptions):
      Observable<WMTSDataSourceOptions> {

    const url = baseOptions.url;
    const version = baseOptions.version;

    const options = this.getCapabilities('wmts', url, version)
      .map((capabilities: any) =>
        this.parseWMTSOptions(baseOptions, capabilities));

    return options;
  }

  getCapabilities(service: 'wms' | 'wmts',
                  baseUrl: string,
                  version?: string): Observable<any> {

    const params = new URLSearchParams();
    params.set('request', 'GetCapabilities');
    params.set('service', service);
    params.set('version', version || '1.3.0');

    const url = baseUrl + '?' + params.toString();
    const cached = this.capabilitiesStore.find(value => value.url === url);
    if (cached !== undefined) {
      return new Observable(c => c.next(cached.capabilities));
    }

    const request = this.http.get(baseUrl, {search: params});

    return this.requestService.register(request)
      .map((res: Response) => {
        const capabilities = this.parsers[service].read(res.text());
        this.cache(url, capabilities);

        return capabilities;
      });
  }

  private parseWMSOptions(baseOptions: WMSDataSourceOptions,
                          capabilities: any): WMSDataSourceOptions {

    const layers = (baseOptions.params as any).layers;
    const layer = this.findDataSourceInCapabilities(
      capabilities.Capability.Layer, layers);

    if (!layer) {
      return baseOptions;
    }

    const metadata = layer.DataURL ? layer.DataURL[0] : undefined;

    const options: WMSDataSourceOptions = ObjectUtils.removeUndefined({
      // Save title under "alias" because we want to overwrite
      // the default, mandatory title. If the title defined
      // in the context is to be used along with the
      // "optionsFromCapabilities" option, then it should be
      // defined under "alias" in the context
      alias: layer.Title,
      view: {
        maxResolution: this.getResolutionFromScale(layer.MaxScaleDenominator) || Infinity,
        minResolution: this.getResolutionFromScale(layer.MinScaleDenominator) || 0
      },
      metadata: {
        url: metadata ? metadata.OnlineResource : undefined
      }
    });

    return ObjectUtils.mergeDeep(options, baseOptions);
  }

  private parseWMTSOptions(baseOptions: WMTSDataSourceOptions,
                           capabilities: any): WMTSDataSourceOptions {
    const options = ol.source.WMTS.optionsFromCapabilities(
      capabilities, baseOptions);

    return Object.assign(options, baseOptions);
  }

  private findDataSourceInCapabilities(layerArray, name): any {
    if (Array.isArray(layerArray)) {
      let layer;
      layerArray.find(value => {
        layer = this.findDataSourceInCapabilities(value, name);
        return layer !== undefined;
      }, this);

      return layer;
    } else if (layerArray.Layer) {
      return this.findDataSourceInCapabilities(layerArray.Layer, name);
    } else {
      if (layerArray.Name && layerArray.Name === name) {
        return layerArray;
      }

      return undefined;
    }
  }

  private cache(url: string, capabilities: any) {
    this.capabilitiesStore.push({
      url: url,
      capabilities: capabilities
    });
  }

  private getResolutionFromScale(scale: number): number {
    const dpi = 25.4 / 0.28;
    return scale / (39.37 * dpi);
  }

}
