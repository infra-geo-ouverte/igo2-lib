import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IgoTestModule } from '../../../test/module';
import { IgoSharedModule } from '../../shared';

import { ToolbarComponent } from './toolbar.component';
import { ToolbarBaseComponent } from './toolbar-base.component';
import { ToolbarItemComponent } from '../toolbar-item';
import { ToolService } from '../shared';

describe('ToolbarComponent', () => {
  let component: ToolbarComponent;
  let fixture: ComponentFixture<ToolbarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        IgoTestModule,
        IgoSharedModule
      ],
      declarations: [
        ToolbarComponent,
        ToolbarBaseComponent,
        ToolbarItemComponent
      ],
      providers: [
        ToolService
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ToolbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
