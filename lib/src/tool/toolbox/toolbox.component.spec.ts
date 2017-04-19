import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IgoSharedModule } from '../../shared';

import { ToolboxComponent } from './toolbox.component';
import { ToolService } from '../shared';

describe('ToolboxComponent', () => {
  let component: ToolboxComponent;
  let fixture: ComponentFixture<ToolboxComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
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
