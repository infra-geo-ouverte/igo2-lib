import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IgoTestModule } from '../../../test/module';
import { IgoSharedModule } from '../../shared';

import { ToolbarBaseComponent } from './toolbar-base.component';
import { ToolbarItemComponent } from '../toolbar-item';

describe('ToolbarBaseComponent', () => {
  let component: ToolbarBaseComponent;
  let fixture: ComponentFixture<ToolbarBaseComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        IgoTestModule,
        IgoSharedModule
      ],
      declarations: [
        ToolbarBaseComponent,
        ToolbarItemComponent
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ToolbarBaseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
