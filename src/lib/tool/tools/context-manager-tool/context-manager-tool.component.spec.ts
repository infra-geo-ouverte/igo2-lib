import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IgoCoreModule } from '../../../core';
import { IgoSharedModule } from '../../../shared';
import { IgoContextModule } from '../../../context';
import { ToolService } from '../../shared/tool.service';

import { ContextManagerToolComponent } from './context-manager-tool.component';

describe('ContextManagerToolComponent', () => {
  let component: ContextManagerToolComponent;
  let fixture: ComponentFixture<ContextManagerToolComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        IgoCoreModule.forRoot(),
        IgoSharedModule,
        IgoContextModule.forRoot(),
      ],
      declarations: [
        ContextManagerToolComponent
      ],
      providers: [
        ToolService
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContextManagerToolComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
