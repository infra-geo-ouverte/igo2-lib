import {
    FeatureMotion,
    FeatureStoreSelectionStrategy,
    FeatureWorkspace,
    WfsWorkspace,
    EditionWorkspace
} from '@igo2/geo';


export function handleZoomAuto(workspace: FeatureWorkspace | WfsWorkspace | EditionWorkspace, storageService) {
    const zoomStrategy = workspace.entityStore
        .getStrategyOfType(FeatureStoreSelectionStrategy) as FeatureStoreSelectionStrategy;
    zoomStrategy.setMotion(storageService.get('zoomAuto') as boolean ? FeatureMotion.Default : FeatureMotion.None);
}

function padTo2Digits(num) {
    return num.toString().padStart(2, '0');
  }

export function getCurrentDateString() {

    const d = new Date();
    const dformat =
    [d.getFullYear(),
      padTo2Digits(d.getMonth() + 1),
      padTo2Digits(d.getDate()), ].join('/') +
    ' ' +
    [padTo2Digits(d.getHours()),padTo2Digits(d.getMinutes())].join(':');
    return dformat;
}


