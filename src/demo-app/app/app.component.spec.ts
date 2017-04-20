import { TestBed, async } from '@angular/core/testing';
import { MaterialModule } from '@angular/material';
import { IgoModule, provideDefaultSearchSources } from '../../lib';

import { AppComponent } from './app.component';

describe('AppComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        MaterialModule,
        IgoModule.forRoot()
      ],
      declarations: [
        AppComponent
      ],
      providers: [
        ...provideDefaultSearchSources()
      ],
    }).compileComponents();
  }));

  it('should create the app', async(() => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  }));

  it('should render title in a h1 tag', async(() => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.debugElement.nativeElement;
    expect(compiled.querySelector('md-card-subtitle').textContent).toContain('Search module');
  }));
});
