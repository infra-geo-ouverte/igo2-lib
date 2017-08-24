import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpModule } from '@angular/http';

import { IgoCoreModule } from '../../core';
import { IgoAuthModule } from '../../auth';
import { IgoSharedModule } from '../../shared';

import { ToolboxComponent } from './toolbox.component';
import { ToolService } from '../shared';

describe('ToolboxComponent', () => {
  let component: ToolboxComponent;
  let fixture: ComponentFixture<ToolboxComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpModule,
        IgoCoreModule.forRoot(),
        IgoAuthModule.forRoot(),
        IgoSharedModule
      ],
      declarations: [
        ToolboxComponent
      ],
      providers: [
        ToolService
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ToolboxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
