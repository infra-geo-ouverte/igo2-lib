import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IgoSharedModule } from '../../../shared';
import { IgoContextModule } from '../../../context';
import { RequestService, MessageService } from '../../../core';
import { ToolService } from '../../shared/tool.service';

import { ContextManagerToolComponent } from './context-manager-tool.component';

describe('ContextManagerToolComponent', () => {
  let component: ContextManagerToolComponent;
  let fixture: ComponentFixture<ContextManagerToolComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        IgoSharedModule,
        IgoContextModule.forRoot(),
      ],
      declarations: [
        ContextManagerToolComponent
      ],
      providers: [
        MessageService,
        RequestService,
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
