import {
  Action,
  EntityStoreFilterCustomFuncStrategy,
  EntityStoreFilterSelectionStrategy,
  Widget
} from '@igo2/common';
import { LanguageService } from '@igo2/core/language';
import { MediaService } from '@igo2/core/media';
import { StorageService } from '@igo2/core/storage';
import {
  EditionWorkspace,
  ExportOptions,
  FeatureMotion,
  FeatureStoreSelectionStrategy,
  FeatureWorkspace,
  OgcFilterableDataSource,
  WfsWorkspace,
  mapExtentStrategyActiveToolTip,
  noElementSelected
} from '@igo2/geo';

import * as jsPDF from 'jspdf';
import 'jspdf-autotable';
import moment from 'moment';
import { BehaviorSubject, map } from 'rxjs';

import { ToolState } from '../../tool';

export function handleZoomAuto(
  workspace: FeatureWorkspace | WfsWorkspace | EditionWorkspace,
  storageService
) {
  const zoomStrategy = workspace.entityStore.getStrategyOfType(
    FeatureStoreSelectionStrategy
  ) as FeatureStoreSelectionStrategy;
  zoomStrategy.setMotion(
    (storageService.get('zoomAuto') as boolean)
      ? FeatureMotion.Default
      : FeatureMotion.None
  );
}

export function getWorkspaceActions(
  workspace: FeatureWorkspace | WfsWorkspace | EditionWorkspace,
  rowsInMapExtentCheckCondition$: BehaviorSubject<boolean>,
  selectOnlyCheckCondition$: BehaviorSubject<boolean>,
  ogcFilterWidget: Widget,
  zoomAuto$: BehaviorSubject<boolean>,
  maximize$: BehaviorSubject<boolean>,
  storageService: StorageService,
  languageService: LanguageService,
  mediaService: MediaService,
  toolState: ToolState
): Action[] {
  const actions = [
    {
      id: 'zoomAuto',
      checkbox: true,
      title: 'igo.integration.workspace.zoomAuto.title',
      tooltip: 'igo.integration.workspace.zoomAuto.tooltip',
      checkCondition: zoomAuto$,
      handler: () => {
        handleZoomAuto(workspace, storageService);
        storageService.set(
          'zoomAuto',
          !storageService.get('zoomAuto') as boolean
        );
      }
    },
    {
      id: 'filterInMapExtent',
      checkbox: true,
      title: 'igo.integration.workspace.inMapExtent.title',
      tooltip: mapExtentStrategyActiveToolTip(workspace),
      checkCondition: rowsInMapExtentCheckCondition$,
      handler: () =>
        rowsInMapExtentCheckCondition$.next(
          !rowsInMapExtentCheckCondition$.value
        )
    },
    {
      id: 'selectedOnly',
      checkbox: true,
      title: 'igo.integration.workspace.selected.title',
      tooltip: 'igo.integration.workspace.selected.tooltip',
      checkCondition: selectOnlyCheckCondition$,
      handler: () =>
        selectOnlyCheckCondition$.next(!selectOnlyCheckCondition$.value)
    },
    {
      id: 'clearselection',
      icon: 'deselect',
      title: 'igo.integration.workspace.clearSelection.title',
      tooltip: 'igo.integration.workspace.clearSelection.tooltip',
      handler: (ws: FeatureWorkspace | WfsWorkspace | EditionWorkspace) => {
        ws.entityStore.state.updateMany(ws.entityStore.view.all(), {
          selected: false
        });
      },
      args: [workspace],
      availability: (ws: FeatureWorkspace | WfsWorkspace | EditionWorkspace) =>
        noElementSelected(ws)
    },
    {
      id: 'featureDownload',
      icon: 'file_save',
      title: 'igo.integration.workspace.download.title',
      tooltip: 'igo.integration.workspace.download.tooltip',
      handler: (ws: FeatureWorkspace | WfsWorkspace | EditionWorkspace) => {
        const filterStrategy = ws.entityStore.getStrategyOfType(
          EntityStoreFilterCustomFuncStrategy
        );
        const filterSelectionStrategy = ws.entityStore.getStrategyOfType(
          EntityStoreFilterSelectionStrategy
        );
        const layersWithSelection = filterSelectionStrategy.active
          ? [ws.layer.id]
          : [];
        toolState.toolToActivateFromOptions({
          tool: 'importExport',
          options: {
            layers: [ws.layer.id],
            featureInMapExtent: filterStrategy.active,
            layersWithSelection
          } as ExportOptions
        });
      },
      args: [workspace]
    },
    {
      id: 'ogcFilter',
      icon: 'filter_alt',
      title: 'igo.integration.workspace.ogcFilter.title',
      tooltip: 'igo.integration.workspace.ogcFilter.tooltip',
      handler: (
        widget: Widget,
        ws: FeatureWorkspace | WfsWorkspace | EditionWorkspace
      ) => {
        ws.activateWidget(widget, {
          map: ws.map,
          layer: ws.layer
        });
      },
      args: [ogcFilterWidget, workspace]
    },
    {
      id: 'maximize',
      title: languageService.translate.instant(
        'igo.integration.workspace.maximize'
      ),
      tooltip: languageService.translate.instant(
        'igo.integration.workspace.maximizeTooltip'
      ),
      icon: 'resize',
      display: () => {
        return maximize$.pipe(map((v) => !v && !mediaService.isMobile()));
      },
      handler: () => {
        if (!mediaService.isMobile()) {
          maximize$.next(true);
        }
      }
    },
    {
      id: 'standardExtent',
      title: languageService.translate.instant(
        'igo.integration.workspace.standardExtent'
      ),
      tooltip: languageService.translate.instant(
        'igo.integration.workspace.standardExtentTooltip'
      ),
      icon: 'resize',
      display: () => {
        return maximize$.pipe(map((v) => v && !mediaService.isMobile()));
      },
      handler: () => {
        maximize$.next(false);
      }
    },
    {
      id: 'print',
      icon: 'print',
      title: 'igo.integration.workspace.print.title',
      tooltip: 'igo.integration.workspace.print.tooltip',
      handler: (ws: FeatureWorkspace | WfsWorkspace | EditionWorkspace) => {
        const title = `${ws.layer.title} (${dateTransform(
          new Date(),
          'YYYY-MM-DD-HH_mm'
        )})`;
        const doc: any = new jsPDF.default('landscape');
        const totalPagesExp = '{total_pages_count_string}';
        doc.text(title, 14, 20);
        doc.autoTable({
          startY: 25,
          tableWidth: 'wrap',
          html: '#currentWorkspaceTable',
          horizontalPageBreak: true,
          styles: { cellPadding: 0.5, minCellWidth: 20, fontSize: 6 },
          didDrawPage: (data) => {
            let str = 'Page ' + doc.internal.getNumberOfPages();
            if (typeof doc.putTotalPages === 'function') {
              str = str + ' / ' + totalPagesExp;
            }
            doc.setFontSize(6);
            const pageSize = doc.internal.pageSize;
            const pageHeight = pageSize.height
              ? pageSize.height
              : pageSize.getHeight();
            doc.text(str, data.settings.margin.left, pageHeight - 10);
          }
        });
        if (typeof doc.putTotalPages === 'function') {
          doc.putTotalPages(totalPagesExp);
        }
        doc.save(`${title}.pdf`);
      },
      args: [workspace]
    }
  ];
  let returnActions = (workspace.layer.dataSource as OgcFilterableDataSource)
    .options.ogcFilters?.enabled
    ? actions
    : actions.filter((action) => action.id !== 'ogcFilter');
  returnActions =
    workspace.layer.options.workspace.printable !== false
      ? actions
      : actions.filter((action) => action.id !== 'print');
  return returnActions;
}

function dateTransform(date: Date, format: string): string {
  return moment(date).format(format);
}
