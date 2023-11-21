export class Helpers {
  public static forEachChild(element: Element, cb: (el: Element) => void) {
    for (let i = 0; i < element.children.length; i++) {
      cb(element.children[i]);
    }
  }
}
