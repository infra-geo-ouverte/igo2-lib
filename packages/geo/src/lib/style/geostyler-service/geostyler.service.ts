import { Injectable } from '@angular/core';

import type { default as OlGeometry } from 'ol/geom/Geometry';
import * as olStyle from 'ol/style';
import OlFeature from 'ol/Feature';

import { createOverlayMarkerStyle } from '../shared/overlay/overlay-marker-style.utils';
import RenderFeature from 'ol/render/Feature';
import { getResolutionFromScale } from '../../map/shared/map.utils';
import { StyleByAttribute } from '../shared/vector/vector-style.interface';
import { ClusterParam } from '../../layer/shared/clusterParam';

//import OlStyleParser from "geostyler-openlayers-parser";
import OpenLayersParser from "geostyler-openlayers-parser";

import OlLayerVector from "ol/layer/Vector";


@Injectable({
  providedIn: 'root'
})

export class GeostylerStyleService {
/**
   * Create a style based on a object as
   * "igoStyle": {
   *       "geoStyler": {
   *         "name": "GeoStyler Test",
   *         "symbolizers":[
   *           {
   *           "kind": "Fill",
   *           "color": "#ff0000",
   *           "width": 5
   *           }
   *         ],
   *         "scaleDenominator": {
   *           "min": 50,
   *           "max": 200
   *         }
   *       }
   *     }
   *
   * @param options
   * @param feature feature to apply style on
   * @param resolution current map resolution, to control label resolution range
   * @returns
   */


    createGeostyle(options: { [key: string]: any }, destStyle: string){
    
    
      options.name;
      let style: any;
      /*style = [
          new olStyle.Style({
            image: new olStyle.Circle({
              radius: radius ? radius[i] : 4,
              stroke: new olStyle.Stroke({
                color: stroke ? stroke[i] : 'black',
                width: width ? width[i] : 1
              }),
              fill: new olStyle.Fill({
                color: fill ? fill[i] : 'black'
              })
            }),
            text: labelStyle instanceof olStyle.Text ? labelStyle : undefined
          })
        ];*/

        style = {
          "name": options.name,
          "rules": [
              {
                  "name": options.ruleName,
                  "symbolizers":[
                      {
                          "kind": options.kind,
                          "wellKnownName": options.wellKnownName,
                          "color": options.color,
                          "radius": options.radius
                      }
                  ]
              }
          ]
        }
        if(destStyle === "ol"){
          //const parser = new OpenLayersParser();
          //return parser.writeStyle(style);
          return this.gsToOl(style, options);
        }
        else{
          return style;
        }
      
      
        
    }

    parseStyle(){

    }

    gsToOl(gsStyle:any, options: { [key: string]: any }){
      //geostyle to OpenLayer
      let style;

      const parser = new OpenLayersParser();
      //const parser = new OlStyleParser();
      return parser.writeStyle(gsStyle);
/*
      style = [
        new olStyle.Style({
          image: new olStyle.Circle({
            radius: 4,
            stroke: new olStyle.Stroke({
              color: 'black',
              width: 1
            }),
            fill: new olStyle.Fill({
              color: 'black'
            })
          })
        })
      ];*/
      //return style;
    }

    gsToMB(){
    //geoStyle to MapBox
    }

    getLabel(feature, labelMatch): string {
        let label = labelMatch;
        if (!label) {
          return;
        }
        const labelToGet = Array.from(labelMatch.matchAll(/\$\{([^\{\}]+)\}/g));
    
        labelToGet.forEach(v => {
          label = label.replace(v[0], feature.get(v[1]));
        });
    
        // Nothing done? check feature's attribute
        if (labelToGet.length === 0 && label === labelMatch) {
          label = feature.get(labelMatch) || labelMatch;
        }
    
        return label;
      }

    private guessTypeFeature(feature) {
        switch (feature.getGeometry().getType()) {
          case 'Point':
          case 'MultiPoint':
          case 'Circle':
            return 'circle';
          default:
            return 'regular';
        }
      }















}
