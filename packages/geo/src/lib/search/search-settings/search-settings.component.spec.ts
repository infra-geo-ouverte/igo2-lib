import { CommonModule } from '@angular/common';
import {
  provideHttpClient,
  withInterceptorsFromDi
} from '@angular/common/http';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatIconTestingModule } from '@angular/material/icon/testing';
import { MatMenuModule } from '@angular/material/menu';
import { MatRadioModule } from '@angular/material/radio';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';

import { provideMockTranslation } from '@igo2/core/language';

import { SearchSourceService } from '../shared/search-source.service';
import { provideDefaultCoordinatesSearchResultFormatter } from '../shared/sources/coordinates.providers';
import { provideDefaultIChercheSearchResultFormatter } from '../shared/sources/icherche.providers';
import { provideILayerSearchResultFormatter } from '../shared/sources/ilayer.providers';
import { SearchSettingsComponent } from './search-settings.component';

describe('SearchSettingsComponent', () => {
  let component: SearchSettingsComponent;
  let fixture: ComponentFixture<SearchSettingsComponent>;

  beforeEach(waitForAsync(() => {
    const spy = jasmine.createSpyObj('SearchSourceService', [
      'getSources',
      'getEnabledSources'
    ]);
    spy.getSources = jasmine.createSpy().and.returnValue([]);
    spy.getEnabledSources = jasmine.createSpy().and.returnValue([]);

    TestBed.configureTestingModule({
      imports: [
        CommonModule,
        MatTooltipModule,
        MatIconModule,
        MatButtonModule,
        MatMenuModule,
        MatRadioModule,
        MatCheckboxModule,
        MatDividerModule,
        MatSlideToggleModule,
        MatIconTestingModule,
        SearchSettingsComponent
      ],
      providers: [
        { provide: SearchSourceService, useValue: spy },
        provideMockTranslation(),
        provideDefaultIChercheSearchResultFormatter(),
        provideDefaultCoordinatesSearchResultFormatter(),
        provideILayerSearchResultFormatter(),
        provideHttpClient(withInterceptorsFromDi())
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
