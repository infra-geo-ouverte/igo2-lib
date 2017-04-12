var path = require('path');

// Helper functions
var ROOT = path.resolve(__dirname);
const EVENT = process.env.npm_lifecycle_event || '';

function hasProcessFlag(flag) {
  return process.argv.join('').indexOf(flag) > -1;
}

function hasNpmFlag(flag) {
  return EVENT.includes(flag);
}

function isWebpackDevServer() {
  return process.argv[1] && !! (/webpack-dev-server/.exec(process.argv[1]));
}

function root(args) {
  args = Array.prototype.slice.call(arguments, 0);
  return path.join.apply(path, [ROOT].concat(args));
}

const helpers = {};
helpers.hasProcessFlag = hasProcessFlag;
helpers.hasNpmFlag = hasNpmFlag;
helpers.isWebpackDevServer = isWebpackDevServer;
helpers.root = root;

const webpack = require('webpack');

/**
 * Webpack Plugins
 */
const ProvidePlugin = require('webpack/lib/ProvidePlugin');
const DefinePlugin = require('webpack/lib/DefinePlugin');
const LoaderOptionsPlugin = require('webpack/lib/LoaderOptionsPlugin');
const UglifyJsPlugin = require('webpack/lib/optimize/UglifyJsPlugin');
const NormalModuleReplacementPlugin = require('webpack/lib/NormalModuleReplacementPlugin');
const ContextReplacementPlugin = require('webpack/lib/ContextReplacementPlugin');

module.exports = {
   devtool: 'source-map',

   resolve: {
      extensions: ['.ts', '.js']
   },

   entry: './lib/src/index.ts',

   output: {
      path: helpers.root('lib', 'bundle'),
      filename: 'igo.js',
      libraryTarget: 'commonjs2',
      library: 'igo'
   },

   // require those dependencies but don't bundle them
   externals: [/^\@angular\//, /^rxjs\//, /^lodash/],

   module: {
      rules: [{
         test: /\.ts$/,
         use: [{
            loader: 'awesome-typescript-loader?declaration=false',
            options: {
               tsconfig: './lib/tsconfig.lib.json'
            }
         },
         {
            loader: 'angular2-template-loader'
         }
         ],
         exclude: [/\.(spec|e2e)\.ts$/]
      },
      {
         test: /\.html$/,
         use: ['raw-loader']
      },
      {
         test: /\.css$/,
         use: ['to-string-loader', 'css-loader']
      },
      {
         test: /\.styl$/,
         use: ['to-string-loader', 'css-loader', 'stylus-loader']
      }
      ]
   },

   plugins: [
      new ContextReplacementPlugin(
         /angular(\\|\/)core(\\|\/)src(\\|\/)linker/,
         helpers.root('lib/src'), // location of your web
         {}
      ),
      // Fix Angular 2
      new NormalModuleReplacementPlugin(
         /facade(\\|\/)async/,
         helpers.root('node_modules/@angular/core/src/facade/async.js')
      ),
      new NormalModuleReplacementPlugin(
         /facade(\\|\/)collection/,
         helpers.root('node_modules/@angular/core/src/facade/collection.js')
      ),
      new NormalModuleReplacementPlugin(
         /facade(\\|\/)errors/,
         helpers.root('node_modules/@angular/core/src/facade/errors.js')
      ),
      new NormalModuleReplacementPlugin(
         /facade(\\|\/)lang/,
         helpers.root('node_modules/@angular/core/src/facade/lang.js')
      ),
      new NormalModuleReplacementPlugin(
         /facade(\\|\/)math/,
         helpers.root('node_modules/@angular/core/src/facade/math.js')
      ),

      new LoaderOptionsPlugin({
         minimize: true,
         debug: false,
         options: {
            htmlLoader: {
               minimize: true,
               removeAttributeQuotes: false,
               caseSensitive: true,
               customAttrSurround: [
                  [/#/, /(?:)/],
                  [/\*/, /(?:)/],
                  [/\[?\(?/, /(?:)/]
               ],
               customAttrAssign: [/\)?\]?=/]
            },

         }
      })
   ]
};
