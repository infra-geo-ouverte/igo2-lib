import * as olstyle from 'ol/style';
import * as olproj from 'ol/proj';

export class EsriStyleGenerator {
  public _converters: any;
  public _renderers: any;

  constructor() {
    this._converters = {};
    this._converters.esriPMS = EsriStyleGenerator._convertEsriPMS;
    this._converters.esriSFS = EsriStyleGenerator._convertEsriSFS;
    this._converters.esriSLS = EsriStyleGenerator._convertEsriSLS;
    this._converters.esriSMS = EsriStyleGenerator._convertEsriSMS;
    this._converters.esriTS = EsriStyleGenerator._convertEsriTS;
    this._renderers = {};
    this._renderers.uniqueValue = this._renderUniqueValue;
    this._renderers.simple = this._renderSimple;
    this._renderers.classBreaks = this._renderClassBreaks;
  }
  static _convertPointToPixel(point) {
    return point / 0.75;
  }
  static _transformColor(color): [number, number, number, number] {
    // alpha channel is different, runs from 0-255 but in ol3 from 0-1
    return [color[0], color[1], color[2], color[3] / 255];
  }

  static _getResolutionForScale(scale, units) {
    const dpi = 96;
    const mpu = olproj.METERS_PER_UNIT[units];
    const inchesPerMeter = 39.3701;
    return parseFloat(scale) / (mpu * inchesPerMeter * dpi);
  }

  /* convert an Esri Text Symbol */
  static _convertEsriTS(symbol) {
    const rotation = EsriStyleGenerator._transformAngle(symbol.angle);
    const text = symbol.text !== undefined ? symbol.text : undefined;
    return new olstyle.Style({
      text: new olstyle.Text({
        fill: new olstyle.Fill({
          color: EsriStyleGenerator._transformColor(symbol.color)
        }),
        font:
          symbol.font.style +
          ' ' +
          symbol.font.weight +
          ' ' +
          symbol.font.size +
          ' px ' +
          symbol.font.family,
        textBaseline: symbol.verticalAlignment,
        textAlign: symbol.horizontalAlignment,
        offsetX: EsriStyleGenerator._convertPointToPixel(symbol.xoffset),
        offsetY: EsriStyleGenerator._convertPointToPixel(symbol.yoffset),
        rotation,
        text
      })
    });
  }
  /* convert an Esri Picture Marker Symbol */
  static _convertEsriPMS(symbol) {
    const src = 'data:' + symbol.contentType + ';base64, ' + symbol.imageData;
    const rotation = EsriStyleGenerator._transformAngle(symbol.angle);

    return new olstyle.Style({
      image: new olstyle.Icon({
        src,
        rotation
      })
    });
  }
  /* convert an Esri Simple Fill Symbol */
  static _convertEsriSFS(symbol) {
    // there is no support in openlayers currently for fill patterns, so style is not interpreted
    const fill = new olstyle.Fill({
      color: EsriStyleGenerator._transformColor(symbol.color)
    });
    const stroke = symbol.outline
      ? EsriStyleGenerator._convertOutline(symbol.outline)
      : undefined;
    return new olstyle.Style({
      fill,
      stroke
    });
  }
  static _convertOutline(outline) {
    let lineDash;
    const color = EsriStyleGenerator._transformColor(outline.color);
    if (outline.style === 'esriSLSDash') {
      lineDash = [5];
    } else if (outline.style === 'esriSLSDashDot') {
      lineDash = [5, 5, 1, 2];
    } else if (outline.style === 'esriSLSDashDotDot') {
      lineDash = [5, 5, 1, 2, 1, 2];
    } else if (outline.style === 'esriSLSDot') {
      lineDash = [1, 2];
    } else if (outline.style === 'esriSLSNull') {
      // line not visible, make color fully transparent
      color[3] = 0;
    }
    return new olstyle.Stroke({
      color,
      lineDash,
      width: EsriStyleGenerator._convertPointToPixel(outline.width)
    });
  }
  /* convert an Esri Simple Line Symbol */
  static _convertEsriSLS(symbol) {
    return new olstyle.Style({
      stroke: EsriStyleGenerator._convertOutline(symbol)
    });
  }
  static _transformAngle(angle) {
    if (angle === 0 || angle === undefined) {
      return undefined;
    }
    const normalRad = (angle * Math.PI) / 180;
    const ol3Rad = -normalRad + Math.PI / 2;
    if (ol3Rad < 0) {
      return 2 * Math.PI + ol3Rad;
    } else {
      return ol3Rad;
    }
  }
  /* convert an Esri Simple Marker Symbol */
  static _convertEsriSMS(symbol) {
    const fill = new olstyle.Fill({
      color: EsriStyleGenerator._transformColor(symbol.color)
    });
    const stroke = symbol.outline
      ? EsriStyleGenerator._convertOutline(symbol.outline)
      : undefined;
    const radius = EsriStyleGenerator._convertPointToPixel(symbol.size) / 2;
    const rotation = EsriStyleGenerator._transformAngle(symbol.angle);
    if (symbol.style === 'esriSMSCircle') {
      return new olstyle.Style({
        image: new olstyle.Circle({
          radius,
          fill,
          stroke
        })
      });
    } else if (symbol.style === 'esriSMSCross') {
      return new olstyle.Style({
        image: new olstyle.RegularShape({
          fill,
          stroke,
          points: 4,
          radius,
          radius2: 0,
          angle: 0,
          rotation
        })
      });
    } else if (symbol.style === 'esriSMSDiamond') {
      return new olstyle.Style({
        image: new olstyle.RegularShape({
          fill,
          stroke,
          points: 4,
          radius,
          rotation
        })
      });
    } else if (symbol.style === 'esriSMSSquare') {
      return new olstyle.Style({
        image: new olstyle.RegularShape({
          fill,
          stroke,
          points: 4,
          radius,
          angle: Math.PI / 4,
          rotation
        })
      });
    } else if (symbol.style === 'esriSMSX') {
      return new olstyle.Style({
        image: new olstyle.RegularShape({
          fill,
          stroke,
          points: 4,
          radius,
          radius2: 0,
          angle: Math.PI / 4,
          rotation
        })
      });
    } else if (symbol.style === 'esriSMSTriangle') {
      return new olstyle.Style({
        image: new olstyle.RegularShape({
          fill,
          stroke,
          points: 3,
          radius,
          angle: 0,
          rotation
        })
      });
    }
  }

  _convertLabelingInfo(labelingInfo, mapUnits) {
    const styles = [];
    for (let i = 0, ii = labelingInfo.length; i < ii; ++i) {
      const labelExpression = labelingInfo[i].labelExpression;
      // only limited support for label expressions
      const field = labelExpression.substr(
        labelExpression.indexOf('[') + 1,
        labelExpression.indexOf(']') - 1
      );
      const symbol = labelingInfo[i].symbol;
      const maxScale = labelingInfo[i].maxScale;
      const minScale = labelingInfo[i].minScale;
      let minResolution = null;
      if (maxScale !== 0) {
        minResolution = EsriStyleGenerator._getResolutionForScale(
          maxScale,
          mapUnits
        );
      }
      let maxResolution = null;
      if (minScale !== 0) {
        maxResolution = EsriStyleGenerator._getResolutionForScale(
          minScale,
          mapUnits
        );
      }
      const style = this._converters[symbol.type].call(this, symbol);
      styles.push(
        (() => {
          return function (feature, resolution) {
            let visible = true;
            if (this.minResolution !== null && this.maxResolution !== null) {
              visible =
                resolution < this.maxResolution &&
                resolution >= this.minResolution;
            } else if (this.minResolution !== null) {
              visible = resolution >= this.minResolution;
            } else if (this.maxResolution !== null) {
              visible = resolution < this.maxResolution;
            }
            if (visible) {
              const value = feature.get(this.field);
              this.style.getText().setText(value);
              return [this.style];
            }
          };
        })().bind({
          minResolution,
          maxResolution,
          field,
          style
        })
      );
    }
    return styles;
  }

  _renderSimple(renderer) {
    const style = this._converters[renderer.symbol.type].call(
      this,
      renderer.symbol
    );
    return (() => {
      return () => {
        return [style];
      };
    })();
  }
  _renderClassBreaks(renderer) {
    const defaultSymbol = renderer.defaultSymbol;
    const defaultStyle = this._converters[defaultSymbol.type].call(
      this,
      defaultSymbol
    );
    const field = renderer.field;
    const classes = [];
    for (let i = 0, ii = renderer.classBreakInfos.length; i < ii; ++i) {
      const classBreakInfo = renderer.classBreakInfos[i];
      let min;
      if (
        classBreakInfo.classMinValue === null ||
        classBreakInfo.classMinValue === undefined
      ) {
        if (i === 0) {
          min = renderer.minValue;
        } else {
          min = renderer.classBreakInfos[i - 1].classMaxValue;
        }
      } else {
        min = classBreakInfo.classMinValue;
      }
      const max = classBreakInfo.classMaxValue;
      const symbol = classBreakInfo.symbol;
      const style = this._converters[symbol.type].call(this, symbol);
      classes.push({ min, max, style });
    }
    return (() => {
      return (feature) => {
        const value = feature.get(field);
        for (let i = 0, ii = classes.length; i < ii; ++i) {
          let condition;
          if (i === 0) {
            condition = value >= classes[i].min && value <= classes[i].max;
          } else {
            condition = value > classes[i].min && value <= classes[i].max;
          }
          if (condition) {
            return [classes[i].style];
          }
        }
        return [defaultStyle];
      };
    })();
  }
  _renderUniqueValue(renderer) {
    const defaultSymbol = renderer.defaultSymbol;
    let defaultStyle = [];
    if (defaultSymbol) {
      defaultStyle = [
        this._converters[defaultSymbol.type].call(this, defaultSymbol)
      ];
    }
    const field = renderer.field1;
    const infos = renderer.uniqueValueInfos;
    const me = this;
    return (() => {
      const hash = {};
      for (let i = 0, ii = infos.length; i < ii; ++i) {
        const info = infos[i];
        const symbol = info.symbol;
        hash[info.value] = [me._converters[symbol.type].call(me, symbol)];
      }

      return (feature) => {
        const style = hash[feature.get(field)];
        return style ? style : defaultStyle;
      };
    })();
  }
  generateStyle(layerInfo, mapUnits) {
    const drawingInfo = layerInfo.drawingInfo;
    let styleFunctions = [];
    const drawingInfoStyle = this._renderers[drawingInfo.renderer.type].call(
      this,
      drawingInfo.renderer
    );
    if (drawingInfoStyle !== undefined) {
      styleFunctions.push(drawingInfoStyle);
    }
    if (layerInfo.labelingInfo) {
      const labelingInfoStyleFunctions = this._convertLabelingInfo(
        layerInfo.labelingInfo,
        mapUnits
      );
      styleFunctions = styleFunctions.concat(labelingInfoStyleFunctions);
    }
    if (styleFunctions.length === 1) {
      return styleFunctions[0];
    } else {
      return (() => {
        return (feature, resolution) => {
          let styles = [];
          for (let i = 0, ii = styleFunctions.length; i < ii; ++i) {
            const result = styleFunctions[i].call(null, feature, resolution);
            if (result) {
              styles = styles.concat(result);
            }
          }
          return styles;
        };
      })();
    }
  }
}
