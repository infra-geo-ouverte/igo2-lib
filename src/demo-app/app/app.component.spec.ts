import { TestBed, async } from '@angular/core/testing';
import { APP_BASE_HREF } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MdSidenavModule, MdCardModule, MdIconModule } from '@angular/material';

import { IgoTestModule } from '../../test/module';
import { IgoModule, provideNominatimSearchSource } from '../../lib';

import { AppComponent } from './app.component';

describe('AppComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterModule.forRoot([]),
        MdSidenavModule,
        MdCardModule,
        MdIconModule,
        IgoModule.forRoot(),
        IgoTestModule
      ],
      declarations: [
        AppComponent
      ],
      providers: [
        [{provide: APP_BASE_HREF, useValue : '/' }],
        provideNominatimSearchSource()
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
    const compiled = fixture.debugElement.nativeElement;
    expect(compiled.querySelector('md-card-subtitle').textContent)
      .toContain('Context module');
  }));
});
