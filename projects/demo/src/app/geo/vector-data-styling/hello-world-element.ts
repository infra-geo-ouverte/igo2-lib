const HELLO_WORLD_TAG = 'hello-world-element';

class HelloWorldElement extends HTMLElement {
  connectedCallback(): void {
    this.textContent = 'Hello World';
  }
}

if (!customElements.get(HELLO_WORLD_TAG)) {
  customElements.define(HELLO_WORLD_TAG, HelloWorldElement);
}
