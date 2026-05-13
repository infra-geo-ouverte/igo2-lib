# Gestion des styles - Guide pilotage utilisateurs

## À quoi sert ce guide

Ce guide montre comment configurer le stylage des couches d'informations vectorielles et de tuiles vectorielles.

## Règle simple

Le style d'une couche se configure dans `style`.

Vous pouvez utiliser:

- un style OpenLayers simple (recommandé pour la lisibilité et l'édition rapide)
- un style Geostyler
- un style Mapbox

## Comment fonctionne le survol

Quand l'utilisateur passe la souris sur une entité, IGO ajoute automatiquement l'attribut `_hovered = true` sur une copie de cette entité.


Implication pour votre configuration:

- prévoir une règle pour `_hovered = true` (style de survol);
- prévoir une règle par défaut (`else: true`) pour l'affichage normal.

## Recettes prêtes à l'emploi

### 1) Style simple pour couche vectorielle

```json
{
  "title": "Points d'intérêt",
  "sourceOptions": {
    "type": "vector",
    "url": "https://exemple.org/poi.geojson"
  },
  "style": {
    "stroke-color": "#005a9c",
    "stroke-width": 2,
    "fill-color": "rgba(0,90,156,0.25)",
    "circle-radius": 6,
    "circle-fill-color": "rgba(0,90,156,0.40)",
    "circle-stroke-color": "#005a9c",
    "circle-stroke-width": 2
  }
}
```

### 2) Style avec hover (_hovered)

```json
{
  "title": "Points d'intérêt avec hover",
  "sourceOptions": {
    "type": "vector",
    "url": "https://exemple.org/poi.geojson"
  },
  "style": [
    {
      "filter": ["==", ["get", "_hovered"], true],
      "style": {
        "circle-radius": 10,
        "circle-fill-color": "#ffffff",
        "circle-stroke-color": "#f2a100",
        "circle-stroke-width": 4,
        "text-value": ["case", ["has", "nom"], ["get", "nom"], ""],
        "text-font": "12px sans-serif",
        "text-fill-color": "#111111",
        "text-background-fill-color": "#ffffff",
        "text-background-stroke-color": "#c8c8c8",
        "text-background-stroke-width": 1,
        "text-padding": [4, 6, 4, 6],
        "text-offset-x": 24
      }
    },
    {
      "else": true,
      "style": {
        "circle-radius": 6,
        "circle-fill-color": "rgba(0,90,156,0.40)",
        "circle-stroke-color": "#005a9c",
        "circle-stroke-width": 2
      }
    }
  ]
}
```

### 3) Style Geostyler

```json
{
  "title": "Réseau routier",
  "sourceOptions": {
    "type": "mvt",
    "url": "https://.../{z}/{x}/{-y}.pbf"
  },
  "style": {
    "type": "Geostyler",
    "style": {
      "name": "Routes",
      "rules": [
        {
          "name": "Autoroutes",
          "filter": ["==", "classe", "Autoroute"],
          "symbolizers": [
            { "kind": "Line", "color": "#e20a16", "width": 4 }
          ]
        }
      ]
    }
  }
}
```

### 4) Style Mapbox

```json
{
  "title": "Couche MVT stylee Mapbox",
  "sourceOptions": {
    "type": "mvt",
    "url": "https://.../{z}/{x}/{-y}.pbf"
  },
  "style": {
    "type": "Mapbox",
    "style": {
      "url": "https://example.com/style.json",
      "source": "main"
    }
  }
}
```

## Query et search overlays

`queryOverlayStyle` et `searchOverlayStyle` sont des styles globaux.

Format:

```ts
{
  base?: AnyOlStyle;
  selection?: AnyOlStyle;
  focus?: AnyOlStyle;
}
```

Exemple:

```ts
queryOverlayStyle: {
  base: {
    'circle-fill-color': 'rgba(94, 208, 251, 0.8)',
    'circle-stroke-color': '#a7e7ff',
    'circle-radius': 6,
    'fill-color': 'rgba(94, 208, 251, 0.2)',
    'stroke-color': 'rgba(94, 208, 251, 0.7)',
    'stroke-width': 2
  }
}
```

## Points d'attention

- Les styles Geostyler/Mapbox nécessitent l'activation des engines.
- Les couches engine sont résolues via `LayerService`.
- Les styles OpenLayers restent la base la plus simple pour une configuration rapide.

## Fallbacks

- Un style de repli est appliqué en cas de style non résolu.
- Les valeurs par défaut sont prévues pour garder un rendu cohérent avec les usages établis.

## Références

- https://github.com/infra-geo-ouverte/igo2-lib/pull/1830
