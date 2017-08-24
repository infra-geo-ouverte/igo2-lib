import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpModule } from '@angular/http';

import { IgoTestModule } from '../../../../test';
import { IgoSharedModule } from '../../../shared';
import { IgoAuthModule } from '../../../auth';
import { IgoContextModule } from '../../../context';
import { ToolService } from '../../shared/tool.service';

import { ContextEditorToolComponent } from './context-editor-tool.component';

describe('ContextEditorToolComponent', () => {
  let component: ContextEditorToolComponent;
  let fixture: ComponentFixture<ContextEditorToolComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpModule,
        IgoTestModule,
        IgoSharedModule,
        IgoContextModule.forRoot(),
        IgoAuthModule.forRoot()
      ],
      declarations: [
        ContextEditorToolComponent
      ],
      providers: [
        ToolService
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContextEditorToolComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
