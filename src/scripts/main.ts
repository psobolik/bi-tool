import svgFile from '../images/bootstrap-icons.svg';
import {SvgLoader} from "./svg-loader.ts";
import {Helpers} from "./Helpers.ts";

window.addEventListener('load', () => {
  document.querySelector(".footer")?.classList.add("in-view");
  (document.getElementById('notify-container') as Element)
    .addEventListener('animationend', _evt => {
      (document.getElementById('notify-container') as Element)
        .classList.remove('notify-animate');
    });
  (document.getElementById('copy-button') as Element)
    .addEventListener('click', handleCopy);
  const filterEl = (document.getElementById('filter') as HTMLInputElement);
  filterEl.value = '';
  filterEl.addEventListener('keyup', handleFilterInput);

  setSelectContainerVisibility();
  loadSymbols();
})

function loadSymbols() {
  SvgLoader.load(svgFile)
    .then(svgDocument => {
      const expression = svgDocument.createExpression('//*[name()="symbol"]/@id');
      const symbolIdAttrs = expression.evaluate(svgDocument, XPathResult.ORDERED_NODE_ITERATOR_TYPE);

      const container = (document.getElementById('symbol-container') as Element);

      let symbolIdAttr = null;
      while (symbolIdAttr = symbolIdAttrs.iterateNext() as Attr) {
        container.appendChild(createSymbolElement(symbolIdAttr.value))
          .addEventListener('click', evt => {
            selectSymbol(evt.target as HTMLElement);
          });
      }
      const svgEl = document.body.insertBefore(svgDocument.firstElementChild as Element, document.getElementById('container')) as SVGElement;
      svgEl.id = 'svg';
      svgEl.style.display = 'none';
    });
}

function getSelectedSymbolIds() {
  const container = (document.getElementById('select-icon-container') as Element);
  const result = new Array<string>()
  Helpers.forEachChild(container, el => {
    result.push(el.id);
  });
  return result;
}

function setSelectContainerVisibility() {
  const container = (document.getElementById('select-container') as HTMLElement);
  if (getSelectedSymbolIds().length) {
    container.style.visibility = 'visible';
    container.style.height = 'auto';
  } else {
    container.style.visibility = 'hidden';
    container.style.height = '0';
  }
}

function getIconContainer(el: HTMLElement) {
  let result: HTMLElement | null = el;
  while (result && !result.classList.contains('icon-container')) {
    result = result.parentElement;
  }
  return result;
}

function selectSymbol(el: HTMLElement) {
  const iconContainer = getIconContainer(el);
  if (iconContainer == null) return;

  const selected = getSelectedSymbolIds();
  if (!selected.includes(iconContainer.id)) {
    const container = (document.getElementById('select-icon-container') as Element);
    el = container.appendChild(createSymbolElement(iconContainer.id));
    el.addEventListener('click', evt => {
      unselectSymbol(evt.target as HTMLElement)
    })
  }
  setSelectContainerVisibility();
}

function unselectSymbol(el: HTMLElement) {
  const iconContainer = getIconContainer(el);
  if (iconContainer == null) return;

  const container = (document.getElementById('select-icon-container') as Element);
  container.removeChild(iconContainer);
  setSelectContainerVisibility();
}

function createSymbolElement(symbolName: string) {
  const iconContainer = document.createElement('div');
  iconContainer.classList.add('icon-container');
  iconContainer.id = symbolName;

  const svgContainer = iconContainer.appendChild(document.createElement('div'));
  svgContainer.classList.add('svg-container');

  const svgElement = svgContainer.appendChild(document.createElementNS('http://www.w3.org/2000/svg', 'svg'));
  svgElement.setAttribute('viewport', '0 0 16 16');

  const useElement = svgElement.appendChild(document.createElementNS('http://www.w3.org/2000/svg', 'use'))
  useElement.setAttribute('href', `#${symbolName}`);

  const label = iconContainer.appendChild(document.createElement('label'));
  label.setAttribute('for', symbolName);
  label.innerText = symbolName;

  return iconContainer;
}

function handleFilterInput(event: KeyboardEvent) {
  function hideSymbols(pattern: string) {
    const re = new RegExp(`^.*${pattern}.*$`);
    const container = (document.getElementById('symbol-container') as Element);
    Helpers.forEachChild(container, el => {
      (el as HTMLElement).style.display = re.test((el.id)) ? '' : 'none';
    });
  }
  hideSymbols((event.target as HTMLInputElement).value);
}

function handleCopy() {
  const selected = getSelectedSymbolIds();
  if (selected.length <= 0) return;

  const svgDocument = document.getElementById('svg');
  if (!svgDocument) return;

  const xmlDocument = document.implementation.createDocument("", "", null);
  xmlDocument.insertBefore(xmlDocument.createProcessingInstruction('xml', 'version="1.0" encoding="UTF-8" standalone="no"'), xmlDocument.firstChild);

  const svgElement = xmlDocument.appendChild(xmlDocument.createElementNS('http://www.w3.org/2000/svg', 'svg'));
  svgElement.setAttribute('viewBox', `0 0 ${16 * selected.length} 16`);

  selected.forEach(id => {
    const node = svgDocument.querySelector(`[id="${id}"]`);
    if (node)
      svgElement.appendChild(xmlDocument.importNode(node, true));
  })

  const xmlSerializer = new XMLSerializer();
  navigator.clipboard.writeText(xmlSerializer.serializeToString(xmlDocument))
    .then(() => {
      (document.getElementById('notify-container') as Element)
        .classList.add('notify-animate');
    })
}
