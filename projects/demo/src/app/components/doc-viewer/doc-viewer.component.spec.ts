import { ComponentFixture, TestBed } from '@angular/core/testing';

import { mergeTestConfig } from 'projects/demo/src/test-config';

import { DocViewerComponent } from './doc-viewer.component';

describe('DocViewerComponent', () => {
  let component: DocViewerComponent;
  let fixture: ComponentFixture<DocViewerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule(
      mergeTestConfig({
        imports: [DocViewerComponent]
      })
    ).compileComponents();

    fixture = TestBed.createComponent(DocViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
