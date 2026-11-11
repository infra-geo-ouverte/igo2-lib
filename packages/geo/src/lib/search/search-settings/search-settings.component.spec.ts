import { ComponentFixture, TestBed } from '@angular/core/testing';

import { provideMockTranslation } from '@igo2/core/language';

import { SearchSourceService } from '../shared/search-source.service';
import { provideDefaultCoordinatesSearchResultFormatter } from '../shared/sources/coordinates.providers';
import { provideDefaultIChercheSearchResultFormatter } from '../shared/sources/icherche.providers';
import { provideILayerSearchResultFormatter } from '../shared/sources/ilayer.providers';
import { SearchSettingsComponent } from './search-settings.component';

describe('SearchSettingsComponent', () => {
  let component: SearchSettingsComponent;
  let fixture: ComponentFixture<SearchSettingsComponent>;

  beforeEach(async () => {
    const searchSourceService = {
      getSources: vi.fn(() => []),
      getEnabledSources: vi.fn(() => [])
    };
    await TestBed.configureTestingModule({
      imports: [SearchSettingsComponent],
      providers: [
        { provide: SearchSourceService, useValue: searchSourceService },
        provideMockTranslation(),
        provideDefaultIChercheSearchResultFormatter(),
        provideDefaultCoordinatesSearchResultFormatter(),
        provideILayerSearchResultFormatter()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SearchSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
