import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IgoTestModule } from '../../../../test/module';
import { IgoCoreModule } from '../../../core';
import { IgoAuthModule } from '../../../auth';
import { IgoSharedModule } from '../../../shared';
import { IgoContextModule } from '../../../context';
import { IgoShareMapModule } from '../../../share-map';
import { IgoMapModule } from '../../../map';
import { MessageService } from '../../../core';
import { ToolService } from '../../shared/tool.service';

import { ShareMapToolComponent } from './share-map-tool.component';

describe('ShareMapToolComponent', () => {
  let component: ShareMapToolComponent;
  let fixture: ComponentFixture<ShareMapToolComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        IgoTestModule,
        IgoCoreModule.forRoot(),
        IgoSharedModule,
        IgoShareMapModule.forRoot(),
        IgoAuthModule.forRoot(),
        IgoContextModule.forRoot(),
        IgoMapModule.forRoot()
      ],
      declarations: [
        ShareMapToolComponent
      ],
      providers: [
        MessageService,
        ToolService
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShareMapToolComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
