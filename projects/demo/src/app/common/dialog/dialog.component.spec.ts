import { OverlayContainer } from '@angular/cdk/overlay';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { FormStepperDialogComponent } from '@igo2/common/form';

import { provideTranslateService } from '@ngx-translate/core';
import { vi } from 'vitest';

import { mergeTestConfig } from '../../../test-config';
import { AppDialogComponent } from './dialog.component';

describe('AppDialogComponent', () => {
  let fixture: ComponentFixture<AppDialogComponent>;
  let dialog: MatDialog;
  let overlayContainer: OverlayContainer;
  let overlayElement: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule(
      mergeTestConfig({
        imports: [NoopAnimationsModule, AppDialogComponent],
        providers: [provideTranslateService()]
      })
    ).compileComponents();

    fixture = TestBed.createComponent(AppDialogComponent);
    dialog = TestBed.inject(MatDialog);
    overlayContainer = TestBed.inject(OverlayContainer);
    overlayElement = overlayContainer.getContainerElement();

    vi.spyOn(window, 'alert').mockImplementation(() => undefined);

    fixture.detectChanges();
  });

  afterEach(() => {
    overlayContainer.ngOnDestroy();
    vi.restoreAllMocks();
  });

  it('should drive the stepper through adaptive visual steps', async () => {
    clickElement(findByText(fixture.nativeElement, 'button', 'Stepper'));
    await fixture.whenStable();
    fixture.detectChanges();

    expect(overlayElement.textContent).toContain('Step 1 of 3');
    expect(overlayElement.textContent).toContain('Choose a country');

    await selectFirstOption(fixture, overlayElement, 'Canada');
    clickElement(findByText(overlayElement, 'button', 'Continue'));
    await fixture.whenStable();
    fixture.detectChanges();

    expect(overlayElement.textContent).toContain(
      'Choose a city and postal format'
    );
    expect(getActiveFieldTitle(dialog, 'postalCode')).toBe('Postal code');

    clickElement(findByText(overlayElement, 'button', 'Back'));
    await fixture.whenStable();
    fixture.detectChanges();

    expect(overlayElement.textContent).toContain('Choose a country');
    expect(overlayElement.textContent).toContain('Canada');

    clickElement(findByText(overlayElement, 'button', 'Continue'));
    await fixture.whenStable();
    fixture.detectChanges();

    expect(getActiveFieldTitle(dialog, 'postalCode')).toBe('Postal code');
    await selectFirstOption(fixture, overlayElement, 'Montreal');
    setActiveFieldValue(dialog, 'postalCode', 'H2X 1Y4');
    clickElement(findByText(overlayElement, 'button', 'Continue'));
    await fixture.whenStable();
    fixture.detectChanges();

    expect(overlayElement.textContent).toContain('Step 3 of 3');
    expect(overlayElement.textContent).toContain('Finish the location');
    expect(getActiveFieldTitle(dialog, 'notes')).toBe('Notes for Montreal');
    expect(overlayElement.textContent).toContain('Finish');
  });
});

function clickElement(element: Element | undefined): void {
  if (!(element instanceof HTMLElement)) {
    throw new Error('Expected an HTML element to click.');
  }

  element.click();
}

function findByText(
  root: ParentNode,
  selector: string,
  text: string
): Element | undefined {
  return Array.from(root.querySelectorAll(selector)).find((element) =>
    element.textContent?.includes(text)
  );
}

async function selectFirstOption(
  fixture: ComponentFixture<AppDialogComponent>,
  root: ParentNode,
  optionText: string
): Promise<void> {
  const trigger = root.querySelector('.mat-mdc-select-trigger');
  clickElement(trigger ?? undefined);
  await fixture.whenStable();
  fixture.detectChanges();

  const option = findByText(root, '[role="option"]', optionText);
  clickElement(option);
  await fixture.whenStable();
  fixture.detectChanges();
}

function setActiveFieldValue(
  dialog: MatDialog,
  fieldName: string,
  value: unknown
): void {
  const field = getActiveField(dialog, fieldName);

  if (!field) {
    throw new Error(`Field not found in active step: ${fieldName}`);
  }

  field.control.setValue(value);
}

function getActiveFieldTitle(
  dialog: MatDialog,
  fieldName: string
): string | undefined {
  return getActiveField(dialog, fieldName)?.title;
}

function getActiveField(
  dialog: MatDialog,
  fieldName: string
):
  | {
      name: string;
      title?: string;
      control: { setValue(value: unknown): void };
    }
  | undefined {
  const component = dialog.openDialogs[0]?.componentInstance as
    FormStepperDialogComponent | undefined;
  return component
    ?.formStepper()
    ?.activeForm()
    .fields.find((activeField) => activeField.name === fieldName);
}
