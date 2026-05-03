type Attribute<T extends keyof HTMLElementTagNameMap> = {
  [K in keyof HTMLElementTagNameMap[T] as HTMLElementTagNameMap[T][K] extends
    | string
    | number
    | boolean
    ? K
    : never]: HTMLElementTagNameMap[T][K];
} & {
  class: string;
};

export type Attributes<T extends keyof HTMLElementTagNameMap> = {
  [K in keyof Attribute<T>]?: Attribute<T>[K];
};

export type EventListeners = {
  [E in keyof HTMLElementEventMap]?: (event: HTMLElementEventMap[E]) => void;
};

export type Child = Node | string;

function setAttribute(
  element: HTMLElement,
  name: string,
  value: string | number | boolean | undefined,
) {
  if (value == null || value === false) {
    element.removeAttribute(name);
    return;
  }
  if (value === true) {
    element.setAttribute(name, "");
    return;
  }
  element.setAttribute(name, String(value));
}

export function createElement<T extends keyof HTMLElementTagNameMap>(
  tag: T,
  attributes: Attributes<T>,
  eventListeners: EventListeners,
  children: Child[],
): HTMLElement {
  const element = document.createElement(tag);

  for (const [name, attribute] of Object.entries(attributes)) {
    setAttribute(element, name, attribute);
  }

  for (const [name, listener] of Object.entries(eventListeners)) {
    if (listener) {
      element.addEventListener(name, listener as EventListener);
    }
  }

  for (const child of children) {
    if (typeof child === "string") {
      element.appendChild(document.createTextNode(child));
      continue;
    }
    element.appendChild(child);
  }

  return element;
}
