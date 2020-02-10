import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IgoLanguageModule } from '@igo2/core';
import { SearchSettingsComponent } from './search-settings.component';
import { CommonModule } from '@angular/common';
import {
  MatTooltipModule,
  MatIconModule,
  MatButtonModule,
  MatMenuModule,
  MatRadioModule,
  MatCheckboxModule,
  MatDividerModule,
  MatSlideToggleModule
} from '@angular/material';

import { SearchSourceService } from '../shared/search-source.service';
import { provideDefaultIChercheSearchResultFormatter } from '../shared/sources/icherche.providers';
import { provideDefaultCoordinatesSearchResultFormatter } from '../shared/sources/coordinates.providers';
import { provideILayerSearchResultFormatter } from '../shared/sources/ilayer.providers';
import { HttpClientModule } from '@angular/common/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

// AoT requires an exported function for factories
export function HttpLoaderFactory(httpClient: HttpClient) {
  return new TranslateHttpLoader(httpClient);
}

describe('SearchSettingsComponent', () => {
  let component: SearchSettingsComponent;
  let fixture: ComponentFixture<SearchSettingsComponent>;

  beforeEach(async(() => {
    const spy = jasmine.createSpyObj('SearchSourceService', [
      'getSources',
      'getEnabledSources'
    ]);
    spy.getSources = jasmine.createSpy().and.returnValue([]);
    spy.getEnabledSources = jasmine.createSpy().and.returnValue([]);

    TestBed.configureTestingModule({
      imports: [
        HttpClientModule,
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useFactory: HttpLoaderFactory,
            deps: [HttpClient]
          }
        }),
        IgoLanguageModule,
        CommonModule,
        MatTooltipModule,
        MatIconModule,
        MatButtonModule,
        MatMenuModule,
        MatRadioModule,
        MatCheckboxModule,
        MatDividerModule,
        MatSlideToggleModule
      ],
      declarations: [SearchSettingsComponent],
      providers: [
        { provide: SearchSourceService, useValue: spy },
        provideDefaultIChercheSearchResultFormatter(),
        provideDefaultCoordinatesSearchResultFormatter(),
        provideILayerSearchResultFormatter()
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
