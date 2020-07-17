export interface InteractiveTourStep {
  element: string;
  intro: string;
  no?: number;
  introEnglish?: string;
  position?: string;
}

export interface InteractiveTourOptions {
  steps: InteractiveTourStep[];
  /* Next button label in tooltip box */
  nextLabel?: string;
  /* Previous button label in tooltip box */
  prevLabel?: string;
  /* Skip button label in tooltip box */
  skipLabel?: string;
  /* Done button label in tooltip box */
  doneLabel?: string;
  /* Hide previous button in the first step? Otherwise, it will be disabled button. */
  hidePrev?: boolean;
  /* Hide next button in the last step? Otherwise, it will be disabled button. */
  hideNext?: boolean;
  /* Default tooltip box position */
  tooltipPosition?: string;
  /* Next CSS class for tooltip boxes */
  tooltipClass?: string;
  /* CSS class that is added to the helperLayer */
  highlightClass?: string;
  /* Close introduction when pressing Escape button? */
  exitOnEsc?: boolean;
  /* Close introduction when clicking on overlay layer? */
  exitOnOverlayClick?: boolean;
  /* Show step numbers in introduction? */
  showStepNumbers?: boolean;
  /* Let user use keyboard to navigate the tour? */
  keyboardNavigation?: boolean;
  /* Show tour control buttons? */
  showButtons?: boolean;
  /* Show tour bullets? */
  showBullets?: boolean;
  /* Show tour progress? */
  showProgress?: boolean;
  /* Scroll to highlighted element? */
  scrollToElement?: boolean;
  /* Should we scroll the tooltip or target element? */
  scrollTo?: string /* Options are: 'element' or 'tooltip'
  /* Padding to add after scrolling when element is not in the viewport (in pixels) */;
  scrollPadding?: number;
  /* Set the overlay opacity */
  overlayOpacity?: number;
  /* Precedence of positions, when auto is enabled */
  positionPrecedence?: ['bottom', 'top', 'right', 'left'];
  /* Disable an interaction with element? */
  disableInteraction?: boolean;
  /* Set how much padding to be used around helper element */
  helperElementPadding?: number;
  /* additional classes to put on the buttons */
  buttonClass?: string;
}
