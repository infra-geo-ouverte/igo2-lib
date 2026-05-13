# Gestion des styles - Guide développeurs

## Objectif

Ce guide décrit comment styler les couches d'informations vectorielles et de tuiles vectorielles.

## Règle principale

Le style d'une couche se définit dans `layer.style`.

Le type accepté est `AnyStyle`:

- OpenLayers natif (objet ou fonction)
- Flat style OpenLayers
- Engine style `Geostyler`
- Engine style `Mapbox`

## Activation des engines

Pour utiliser `Geostyler` et `Mapbox`, enregistrer les providers au bootstrap:

```ts
provideStyle(withGeostyler(), withMapbox());
```

Les couches engine sont résolues via `LayerService`.

## Importance de passer par `LayerService`

La recommandation de l'équipe projet est de **créer les couches via `LayerService`**.

Pourquoi :

- `LayerService` centralise la résolution des styles (OpenLayers, Geostyler, Mapbox) et les comportements associés ;
- il applique les conventions du projet de manière uniforme ;
- il réduit les écarts entre implémentations locales et comportement attendu ;
- il facilite les évolutions futures sans devoir corriger chaque intégration manuelle.

Ce passage par `LayerService` est aujourd'hui fortement recommandé.


## Gestion du hover (_hovered)


Fonctionnement runtime:

- au survol, une copie de l'entité cible reçoit `_hovered = true`;
- le style est réévalué et applique la règle correspondant à l'état `_hovered`.

Implication côté style:

- votre `style` doit contenir une règle explicite pour `_hovered = true`;
- prévoir une règle par défaut (`else`) pour l'état normal.

## Exemples de styles

### 1) Flat style OpenLayers

```ts
style: {
  'fill-color': 'rgba(0, 90, 156, 0.25)',
  'stroke-color': '#005a9c',
  'stroke-width': 2,
  'circle-radius': 6,
  'circle-fill-color': 'rgba(0, 90, 156, 0.4)',
  'circle-stroke-color': '#005a9c',
  'circle-stroke-width': 2
}
```

### 2) Style OpenLayers par fonction

```ts
style: (feature) => {
  const hovered = feature.get('_hovered') === true;
  return hovered
    ? {
        'circle-radius': 10,
        'circle-stroke-width': 4,
        'circle-stroke-color': '#f2a100',
        'circle-fill-color': '#ffffff'
      }
    : {
        'circle-radius': 5,
        'circle-fill-color': '#007acc'
      };
}
```

### 3) Hover par règles (_hovered)

```ts
style: [
  {
    filter: ['==', ['get', '_hovered'], true],
    style: {
      'circle-radius': 10,
      'circle-stroke-width': 4,
      'circle-stroke-color': '#f2a100',
      'circle-fill-color': '#ffffff',
      'text-value': ['case', ['has', 'nom'], ['get', 'nom'], ''],
      'text-font': '12px sans-serif',
      'text-fill-color': '#111111',
      'text-background-fill-color': '#ffffff',
      'text-background-stroke-color': '#c8c8c8',
      'text-background-stroke-width': 1,
      'text-padding': [4, 6, 4, 6],
      'text-offset-x': 24
    }
  },
  {
    else: true,
    style: {
      'circle-radius': 5,
      'circle-fill-color': '#007acc',
      'circle-stroke-color': '#ffffff',
      'circle-stroke-width': 2
    }
  }
]
```

### 4) Style Geostyler

```ts
style: {
  type: 'Geostyler',
  style: {
    name: 'Routes',
    rules: [
      {
        name: 'Autoroutes',
        filter: ['==', 'classe', 'Autoroute'],
        symbolizers: [
          { kind: 'Line', color: '#e20a16', width: 4 }
        ]
      }
    ]
  }
}
```

### 5) Style Mapbox

```ts
style: {
  type: 'Mapbox',
  style: {
    url: 'https://example.com/style.json',
    source: 'main'
  }
}
```

## Query et search overlays

Les overlays de recherche/requête se configurent via:

- `queryOverlayStyle`
- `searchOverlayStyle`

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
searchOverlayStyle: {
  base: {
    'stroke-color': 'rgba(94, 208, 251, 0.7)',
    'stroke-width': 2,
    'fill-color': 'rgba(94, 208, 251, 0.2)'
  },
  focus: {
    'stroke-color': 'rgba(94, 208, 251, 1)',
    'stroke-width': 3,
    'fill-color': 'rgba(94, 208, 251, 0.3)'
  },
  selection: {
    'stroke-color': 'rgba(0, 161, 222, 1)',
    'stroke-width': 3,
    'fill-color': 'rgba(0, 161, 222, 0.3)'
  }
}
```

## Comportement de fallback

Pour assurer un rendu robuste:

- les styles OpenLayers standards sont toujours acceptés
- un style de repli est appliqué si un style engine ne peut pas être résolu
- les valeurs par défaut ont été alignées pour garder un rendu proche des usages établis

## Références

- https://github.com/infra-geo-ouverte/igo2-lib/pull/1830
