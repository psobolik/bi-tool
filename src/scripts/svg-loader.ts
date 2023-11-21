export class SvgLoader {
  static async load(fileName: URL | RequestInfo): Promise<XMLDocument> {
    return fetch(fileName)
      .then(result => result.text())
      .then(text => {
        return new Promise(resolve => {
          const domParser = new DOMParser();
          resolve(domParser.parseFromString(text, "image/svg+xml") as XMLDocument);
        })
      })
  }
}
