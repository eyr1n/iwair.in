import {
  type Attributes,
  type Child,
  createElement,
  type EventListeners,
} from "./index";

export namespace JSX {
  export type Element = HTMLElement;
  export type IntrinsicElements = {
    [K in keyof HTMLElementTagNameMap]: Attributes<K> & {
      on?: EventListeners;
      children?: Child | Child[];
    };
  };
  export interface ElementChildrenAttribute {
    children: object;
  }
}

export function jsx(
  tag: keyof JSX.IntrinsicElements | ((props: object) => HTMLElement),
  props: object & {
    on?: EventListeners;
    children?: Child | Child[];
  },
): HTMLElement {
  if (typeof tag === "string") {
    const { on, children, ...attributes } = props;
    return createElement(tag, attributes, on ?? {}, [children ?? []].flat());
  }
  return tag(props);
}

export { jsx as jsxs };
