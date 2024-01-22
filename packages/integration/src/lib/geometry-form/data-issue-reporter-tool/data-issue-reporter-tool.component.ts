import { HttpClient } from '@angular/common/http';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Validators } from '@angular/forms';

import { Form, FormService, ToolComponent } from '@igo2/common';
import { LanguageService, MessageService } from '@igo2/core';
import { IgoMap } from '@igo2/geo';

import * as olstyle from 'ol/style';

import { BehaviorSubject, combineLatest } from 'rxjs';
import type { Subscription } from 'rxjs';

import { MapState } from '../../map/map.state';

interface DataIssueReporterData {
  geometry: object;
  layer: string;
  desc: string;
  email: string;
}

@ToolComponent({
  name: 'dataIssueReporter',
  title: 'igo.integration.tools.dataIssueReporter',
  icon: 'message-alert'
})
@Component({
  selector: 'igo-issue-reporter-tool',
  templateUrl: './data-issue-reporter-tool.component.html',
  styleUrls: ['./data-issue-reporter-tool.component.scss']
})
export class DataIssueReporterToolComponent implements OnInit, OnDestroy {
  /**
   * Url to report the data issue. Use the Post protocol to send the form.
   */
  @Input() url: string;

  /**
   * Map to link to the form
   * @internal
   */
  get map(): IgoMap {
    return this.mapState.map;
  }

  form$ = new BehaviorSubject<Form>(undefined);

  data$ = new BehaviorSubject<{ [key: string]: any }>(undefined);

  submitDisabled = true;

  private valueChanges$$: Subscription;

  constructor(
    private mapState: MapState,
    private formService: FormService,
    private languageService: LanguageService,
    private messageService: MessageService,
    private httpClient: HttpClient
  ) {}

  ngOnInit() {
    combineLatest([this.languageService.language$, this.map.layers$]).subscribe(
      ([language, layers]) => {
        const baseLayerOrShownInLayerList = layers
          .filter((l) => l.baseLayer || l.showInLayerList)
          .map((l) => {
            return { value: `${l.title}-${l.id}`, title: l.title };
          });
        const fieldConfigs = [
          {
            name: 'geometry',
            title: this.languageService.translate.instant(
              'igo.integration.dataIssueReporterTool.geometry'
            ),
            type: 'geometry',
            inputs: {
              map: this.map,
              geometryTypeField: true,
              geometryType: 'Polygon',
              drawGuideField: false,
              drawGuide: 0,
              drawGuidePlaceholder: this.languageService.translate.instant(
                'igo.integration.dataIssueReporterTool.drawGuidePlaceholder'
              ),
              drawStyle: new olstyle.Style({
                stroke: new olstyle.Stroke({
                  color: [255, 0, 0, 1],
                  width: 2
                }),
                fill: new olstyle.Fill({
                  color: [255, 0, 0, 0.2]
                }),
                image: new olstyle.Circle({
                  radius: 8,
                  stroke: new olstyle.Stroke({
                    color: [255, 0, 0, 1]
                  }),
                  fill: new olstyle.Fill({
                    color: [255, 0, 0, 0.2]
                  })
                })
              }),
              overlayStyle: new olstyle.Style({
                stroke: new olstyle.Stroke({
                  color: [0, 255, 0, 1],
                  width: 2
                }),
                fill: new olstyle.Fill({
                  color: [0, 255, 0, 0.2]
                }),
                image: new olstyle.Circle({
                  radius: 8,
                  stroke: new olstyle.Stroke({
                    color: [0, 255, 0, 1]
                  }),
                  fill: new olstyle.Fill({
                    color: [0, 255, 0, 0.2]
                  })
                })
              })
            }
          },
          {
            name: 'layer',
            title: this.languageService.translate.instant(
              'igo.integration.dataIssueReporterTool.layer'
            ),
            type: 'select',
            options: {
              cols: 2
            },
            inputs: {
              choices: baseLayerOrShownInLayerList
            }
          },
          {
            name: 'desc',
            title: this.languageService.translate.instant(
              'igo.integration.dataIssueReporterTool.description'
            ),
            type: 'textarea',
            options: {
              validator: Validators.required
            }
          },
          {
            name: 'email',
            title: this.languageService.translate.instant(
              'igo.integration.dataIssueReporterTool.email'
            ),
            options: {
              validator: Validators.email
            }
          }
        ];

        const fields = fieldConfigs.map((config) =>
          this.formService.field(config)
        );
        const form = this.formService.form(fields, []);

        this.valueChanges$$ = form.control.valueChanges.subscribe(() => {
          this.submitDisabled = !form.control.valid;
        });

        this.form$.next(form);
      }
    );
  }

  ngOnDestroy() {
    this.valueChanges$$.unsubscribe();
  }

  clearForm() {
    this.form$.value.control.reset();
  }

  onSubmit(data: DataIssueReporterData) {
    const submitTitle = 'igo.integration.dataIssueReporterTool.submit.title';
    if (!this.url) {
      this.messageService.alert(
        'igo.integration.dataIssueReporterTool.submit.setupMessage',
        submitTitle
      );
      alert(JSON.stringify(data));
    } else {
      this.httpClient
        .post<DataIssueReporterData>(this.url, data)
        .subscribe(() => {
          this.messageService.success(
            'igo.integration.dataIssueReporterTool.submit.message',
            submitTitle
          );
        });
      this.clearForm();
    }
  }
}
