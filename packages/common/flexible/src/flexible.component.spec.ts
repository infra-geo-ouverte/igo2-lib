import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MediaService } from '@igo2/core/media';

import { mergeTestConfig } from 'packages/common/test-config';

import { FlexibleComponent } from './flexible.component';

describe('FlexibleComponent', () => {
  let component: FlexibleComponent;
  let fixture: ComponentFixture<FlexibleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule(
      mergeTestConfig({
        imports: [FlexibleComponent],
        providers: [MediaService]
      })
    ).compileComponents();

    fixture = TestBed.createComponent(FlexibleComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
