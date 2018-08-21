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
    var dpi = 25.4 / 0.28;
    var mpu = olproj.METERS_PER_UNIT[units];
    var inchesPerMeter = 39.37;
    return parseFloat(scale) / (mpu * inchesPerMeter * dpi);
  }

  _convertLabelingInfo(labelingInfo, mapUnits) {
    var styles = [];
    for (var i = 0, ii = labelingInfo.length; i < ii; ++i) {
      var labelExpression = labelingInfo[i].labelExpression;
      // only limited support for label expressions
      var field = labelExpression.substr(
        labelExpression.indexOf('[') + 1,
        labelExpression.indexOf(']') - 1
      );
      var symbol = labelingInfo[i].symbol;
      var maxScale = labelingInfo[i].maxScale;
      var minScale = labelingInfo[i].minScale;
      var minResolution = null;
      if (maxScale !== 0) {
        minResolution = EsriStyleGenerator._getResolutionForScale(
          maxScale,
          mapUnits
        );
      }
      var maxResolution = null;
      if (minScale !== 0) {
        maxResolution = EsriStyleGenerator._getResolutionForScale(
          minScale,
          mapUnits
        );
      }
      var style = this._converters[symbol.type].call(this, symbol);
      styles.push(
        (function() {
          return function(feature, resolution) {
            var visible = true;
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
              var value = feature.get(this.field);
              this.style.getText().setText(value);
              return [this.style];
            }
          };
        })().bind({
          minResolution: minResolution,
          maxResolution: maxResolution,
          field: field,
          style: style
        })
      );
    }
    return styles;
  }
  /* convert an Esri Text Symbol */
  static _convertEsriTS(symbol) {
    var rotation = EsriStyleGenerator._transformAngle(symbol.angle);
    var text = symbol.text !== undefined ? symbol.text : undefined;
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
        rotation: rotation,
        text: text
      })
    });
  }
  /* convert an Esri Picture Marker Symbol */
  static _convertEsriPMS(symbol) {
    var src = 'data:' + symbol.contentType + ';base64, ' + symbol.imageData;
    var rotation = EsriStyleGenerator._transformAngle(symbol.angle);

    return new olstyle.Style({
      image: new olstyle.Icon({
        src: src,
        rotation: rotation
      })
    });
  }
  /* convert an Esri Simple Fill Symbol */
  static _convertEsriSFS(symbol) {
    // there is no support in openlayers currently for fill patterns, so style is not interpreted
    var fill = new olstyle.Fill({
      color: EsriStyleGenerator._transformColor(symbol.color)
    });
    var stroke = symbol.outline
      ? EsriStyleGenerator._convertOutline(symbol.outline)
      : undefined;
    return new olstyle.Style({
      fill: fill,
      stroke: stroke
    });
  }
  static _convertOutline(outline) {
    var lineDash;
    var color = EsriStyleGenerator._transformColor(outline.color);
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
      color: color,
      lineDash: lineDash,
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
    var normalRad = (angle * Math.PI) / 180;
    var ol3Rad = -normalRad + Math.PI / 2;
    if (ol3Rad < 0) {
      return 2 * Math.PI + ol3Rad;
    } else {
      return ol3Rad;
    }
  }
  /* convert an Esri Simple Marker Symbol */
  static _convertEsriSMS(symbol) {
    var fill = new olstyle.Fill({
      color: EsriStyleGenerator._transformColor(symbol.color)
    });
    var stroke = symbol.outline
      ? EsriStyleGenerator._convertOutline(symbol.outline)
      : undefined;
    var radius = EsriStyleGenerator._convertPointToPixel(symbol.size) / 2;
    var rotation = EsriStyleGenerator._transformAngle(symbol.angle);
    if (symbol.style === 'esriSMSCircle') {
      return new olstyle.Style({
        image: new olstyle.Circle({
          radius: radius,
          fill: fill,
          stroke: stroke
        })
      });
    } else if (symbol.style === 'esriSMSCross') {
      return new olstyle.Style({
        image: new olstyle.RegularShape({
          fill: fill,
          stroke: stroke,
          points: 4,
          radius: radius,
          radius2: 0,
          angle: 0,
          rotation: rotation
        })
      });
    } else if (symbol.style === 'esriSMSDiamond') {
      return new olstyle.Style({
        image: new olstyle.RegularShape({
          fill: fill,
          stroke: stroke,
          points: 4,
          radius: radius,
          rotation: rotation
        })
      });
    } else if (symbol.style === 'esriSMSSquare') {
      return new olstyle.Style({
        image: new olstyle.RegularShape({
          fill: fill,
          stroke: stroke,
          points: 4,
          radius: radius,
          angle: Math.PI / 4,
          rotation: rotation
        })
      });
    } else if (symbol.style === 'esriSMSX') {
      return new olstyle.Style({
        image: new olstyle.RegularShape({
          fill: fill,
          stroke: stroke,
          points: 4,
          radius: radius,
          radius2: 0,
          angle: Math.PI / 4,
          rotation: rotation
        })
      });
    } else if (symbol.style === 'esriSMSTriangle') {
      return new olstyle.Style({
        image: new olstyle.RegularShape({
          fill: fill,
          stroke: stroke,
          points: 3,
          radius: radius,
          angle: 0,
          rotation: rotation
        })
      });
    }
  }
  _renderSimple(renderer) {
    var style = this._converters[renderer.symbol.type].call(
      this,
      renderer.symbol
    );
    return (function() {
      return function() {
        return [style];
      };
    })();
  }
  _renderClassBreaks(renderer) {
    var defaultSymbol = renderer.defaultSymbol;
    var defaultStyle = this._converters[defaultSymbol.type].call(
      this,
      defaultSymbol
    );
    var field = renderer.field;
    var classes = [];
    for (var i = 0, ii = renderer.classBreakInfos.length; i < ii; ++i) {
      var classBreakInfo = renderer.classBreakInfos[i];
      var min;
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
      var max = classBreakInfo.classMaxValue;
      var symbol = classBreakInfo.symbol;
      var style = this._converters[symbol.type].call(this, symbol);
      classes.push({ min: min, max: max, style: style });
    }
    return (function() {
      return function(feature) {
        var value = feature.get(field);
        for (i = 0, ii = classes.length; i < ii; ++i) {
          var condition;
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
    var defaultSymbol = renderer.defaultSymbol;
    var defaultStyle = [];
    if (defaultSymbol) {
      defaultStyle = [
        this._converters[defaultSymbol.type].call(this, defaultSymbol)
      ];
    }
    var field = renderer.field1;
    var infos = renderer.uniqueValueInfos;
    var me = this;
    return (function() {
      var hash = {};
      for (var i = 0, ii = infos.length; i < ii; ++i) {
        var info = infos[i],
          symbol = info.symbol;
        hash[info.value] = [me._converters[symbol.type].call(me, symbol)];
      }

      return function(feature) {
        var style = hash[feature.get(field)];
        return style ? style : defaultStyle;
      };
    })();
  }
  generateStyle(layerInfo, mapUnits) {
    var drawingInfo = layerInfo.drawingInfo;
    var styleFunctions = [];
    var drawingInfoStyle = this._renderers[drawingInfo.renderer.type].call(
      this,
      drawingInfo.renderer
    );
    if (drawingInfoStyle !== undefined) {
      styleFunctions.push(drawingInfoStyle);
    }
    if (layerInfo.labelingInfo) {
      var labelingInfoStyleFunctions = this._convertLabelingInfo(
        layerInfo.labelingInfo,
        mapUnits
      );
      styleFunctions = styleFunctions.concat(labelingInfoStyleFunctions);
    }
    if (styleFunctions.length === 1) {
      return styleFunctions[0];
    } else {
      return (function() {
        return function(feature, resolution) {
          var styles = [];
          for (var i = 0, ii = styleFunctions.length; i < ii; ++i) {
            var result = styleFunctions[i].call(null, feature, resolution);
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
