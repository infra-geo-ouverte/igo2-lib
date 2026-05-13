# PR #1830 — Breaking changes, nouveaux comportements et plan de migration

## Objectif

Ce PR réécrit le modèle de stylage de `igo2-lib` en centralisant le style sur `layer.style` et en introduisant des moteurs de style fournis explicitement : `GeoStyler` et `Mapbox`.

## TL;DR

- `layer.style` est désormais le point d’entrée unique pour tous les styles.
- `AnyStyle` accepte : OpenLayers natif, flat styles OL, `GeoStyler` et `Mapbox`.
- `Mapbox` et `GeoStyler` fonctionnent uniquement après enregistrement des providers via `provideStyle(...)`.
- Les mécanismes legacy suivants sont supprimés : `igoStyle`, `styleByAttribute`, `hoverStyle`, `StyleListService`, `importWithStyle`.
- Les styles de recherche/query migrent vers `ConfigurableStylesOptions`.

## Nouveau modèle de style

### 1. `layer.style` devient le contrat unique

Le champ `style` des options de couche accepte maintenant :

- un style OpenLayers natif ou une fonction,
- un flat style OpenLayers,
- un engine `GeoStyler`,
- un engine `Mapbox`.

### 2. Enregistrement des moteurs

Les moteurs de style doivent être fournis explicitement :

```ts
provideStyle(
  withGeostyler(),
  withMapbox()
);
```

### 3. Exemple GeoStyler

```ts
style: {
  type: 'Geostyler',
  style: {
    name: 'Mon style GeoStyler',
    rules: [/* ... */]
  }
}
```

### 4. Exemple Mapbox

```ts
style: {
  type: 'Mapbox',
  style: {
    url: 'https://example.com/style.json',
    source: 'main'
  }
}
```

### 5. Exigence de `LayerService`

Les styles `Mapbox` et `GeoStyler` sont résolus via `LayerService`. Pour ces engines, il faut créer les couches avec `LayerService` et enregistrer les providers moteur.

## Breaking changes

- `igoStyle`, `igoStyleObject`, `hoverStyle`, `mapboxStyle`, `styleByAttribute`, `clusterBaseStyle` sont retirés.
- `igoStyle.editable` ne pilote plus l’édition de style.
- `StyleListService`, `style-list/`, `IgoStyleListModule` sont supprimés.
- `importExport.importWithStyle` est supprimé.
- `StyleService` historique est remplacé par un `StyleService` orienté engine.
- `map.queryResultsOverlay` et `map.searchResultsOverlay` ne sont plus exposés.

## Types et interfaces clés

- `StyleEngineKind` : `'Geostyler' | 'Mapbox'` ([source](https://github.com/infra-geo-ouverte/igo2-lib/blob/master/packages/geo/src/lib/style/shared/style.enum.ts))
- `EngineLayerStyle` : `{ type: 'Geostyler' | 'Mapbox'; style?: unknown }` ([source](https://github.com/infra-geo-ouverte/igo2-lib/blob/master/packages/geo/src/lib/style/shared/style.base.interface.ts))
- `AnyOlStyle` : style OpenLayers natif / flat / fonction ([source](https://github.com/infra-geo-ouverte/igo2-lib/blob/master/packages/geo/src/lib/style/shared/style.types.ts))
- `AnyStyle` : `AnyOlStyle | EngineLayerStyle` ([source](https://github.com/infra-geo-ouverte/igo2-lib/blob/master/packages/geo/src/lib/style/shared/style.types.ts))
- `ConfigurableStylesOptions` : `{ base?: AnyOlStyle; selection?: AnyOlStyle; focus?: AnyOlStyle }` ([source](https://github.com/infra-geo-ouverte/igo2-lib/blob/master/packages/geo/src/lib/style/shared/style.interface.ts))
- `StyleEngineFeature` : moteur fourni via `provideStyle(...)` ([source](https://github.com/infra-geo-ouverte/igo2-lib/blob/master/packages/geo/src/lib/style/shared/style.interface.ts))

## Migration rapide

### Cas 1 — `igoStyle` vers `style`

Avant :

```ts
igoStyle: {
  igoStyleObject: {
    fill: { color: 'rgba(0,0,255,0.3)' },
    stroke: { color: '#0000ff', width: 2 }
  }
}
```

Après :

```ts
style: {
  'fill-color': 'rgba(0,0,255,0.3)',
  'stroke-color': '#0000ff',
  'stroke-width': 2
}
```

### Cas 2 — `mapboxStyle` vers engine Mapbox

Avant :

```ts
igoStyle: {
  mapboxStyle: {
    url: 'https://example.com/style.json',
    source: 'main'
  }
}
```

Après :

```ts
style: {
  type: 'Mapbox',
  style: {
    url: 'https://example.com/style.json',
    source: 'main'
  }
}
```

Bootstrap requis :

```ts
provideStyle(withMapbox());
```

### Cas 3 — `hoverStyle` vers `_hovered`

L’ancienne logique hover est remplacée par un style qui détecte la propriété `_hovered` sur la feature.

Exemple :

```ts
style: [
  {
    filter: ['==', ['get', '_hovered'], true],
    style: {
      'circle-radius': 12,
      'circle-stroke-width': 4,
      'circle-stroke-color': '#f2a100'
    }
  },
  {
    else: true,
    style: {
      'circle-radius': 5,
      'circle-fill-color': '#007acc'
    }
  }
]
```

### Cas 4 — `styleByAttribute` vers GeoStyler

Les règles complexes basées sur un attribut peuvent migrer vers un style `flat style OpenLayers` ou vers un style `GeoStyler` explicitement construit.

Exemple GeoStyler :

```ts
style: {
  type: 'Geostyler',
  style: {
    name: 'Pays',
    rules: [
      {
        name: 'Canada',
        filter: ['==', 'abbrev', 'Can.'],
        symbolizers: [
          { kind: 'Fill', color: '#000000' },
          { kind: 'Line', color: '#ff0000', width: 5 },
          {
            kind: 'Text',
            label: '{{geounit}}',
            color: '#000000'
          }
        ]
      }
    ]
  }
}
```

Bootstrap requis :

```ts
provideStyle(withGeostyler());
```

### Cas 5 — `importWithStyle`

Cette option n’existe plus. Après import, appliquer un style explicite au layer si nécessaire.

```ts
style: {
  'fill-color': 'rgba(0,128,255,0.2)',
  'stroke-color': '#0080ff',
  'stroke-width': 2,
  'circle-radius': 6
}
```

Un style par défaut aléatoire sera fourni et sera éditable par le UI au besoin.

### Cas 6 — migration des styles de recherche / query

Les anciens `queryOverlayStyle` et `searchOverlayStyle` deviennent un objet `ConfigurableStylesOptions` :

```ts
{
  base?: AnyOlStyle;
  selection?: AnyOlStyle;
  focus?: AnyOlStyle;
}
```

Ces styles sont désormais gérés par les outils de recherche et de requête plutôt que par des overlays exposés sur `map`.
#### Avant

```ts
// Dans environnement.ts ou config.json
queryOverlayStyle: {
  base: {
    markerColor: '#5ed0fb',
    markerOpacity: 0.8,
    markerOutlineColor: '#a7e7ff',
    fillColor: '#5ed0fb', 
    fillOpacity: 0.2,
    strokeColor: '#5ed0fb', 
    strokeOpacity: 0.7,
    strokeWidth: 2
  }
}
```

#### Après

```ts
// Dans environnement.ts ou config.json
queryOverlayStyle: {
  base: {
    'circle-fill-color': 'rgba(94, 208, 251, 0.8)',
    'circle-stroke-color': '#a7e7ff',
    'circle-radius': 6,
    'fill-color': 'rgba(94, 208, 251, 0.2)',
    'stroke-color': 'rgba(94, 208, 251, 0.7)',
    'stroke-width': 2
  },
}
```
## Recommandations de migration

1. Inventorier les usages de :
   - `igoStyle`, `styleByAttribute`, `hoverStyle`, `mapboxStyle`,
   - `StyleListService`, `importWithStyle`,
   - `queryResultsOverlay`, `searchResultsOverlay`.
2. Remplacer les cas simples par `style` plat OL.
3. Enregistrer `withMapbox()` et `withGeostyler()` avant d’utiliser des engine styles.
4. Vérifier les types : `VectorLayerOptions.style` et `VectorTileLayerOptions.style` acceptent maintenant `AnyStyle`.
5. Tester les overlays de query/search avec `ConfigurableStylesOptions`.

## À retenir

- Le futur du stylage est `layer.style`.
- Les engines `GeoStyler` et `Mapbox` sont des modes d’entrée supplémentaires, pas des options legacy.
- `StyleService` historique, `igoStyle` et les styles hover/attributs sont supprimés.
- `StyleEngineKind`, `EngineLayerStyle`, `AnyStyle` et `ConfigurableStylesOptions` sont les interfaces clés à connaître.
