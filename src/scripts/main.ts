import svgFile from '../images/bootstrap-icons.svg';
import {SvgLoader} from "./svg-loader.ts";

window.addEventListener('load', () => {
  const notifyContainer = document.getElementById('notify-container');
  notifyContainer?.addEventListener('animationend', _evt => {
    notifyContainer.classList.remove('notify-animate');
  });
  document.querySelector(".footer")?.classList.add("in-view");
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
      const container = (document.getElementById('symbol-container') as Element);
      svgDocument.querySelectorAll('symbol').forEach(symbol => {
        container.appendChild(createSymbolElement(symbol.id))
          .addEventListener('click', evt => {
            selectSymbol(evt.target as HTMLElement);
          });
      })
      const svgEl = document.body.insertBefore(svgDocument.firstElementChild as Element,
        document.getElementById('container')) as SVGElement;
      svgEl.id = 'svg';
      svgEl.style.display = 'none';
    });
}

function getSelectedSymbolIds() {
  const container = (document.getElementById('select-icon-container') as Element);
  return [...container.children].map(child => child.id);
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

function findIconContainer(el: HTMLElement): Element | null {
  return el?.closest('.icon-container');
}

function selectSymbol(el: HTMLElement) {
  const iconContainer = findIconContainer(el);
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
  const iconContainer = findIconContainer(el);
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

  const useElement = svgElement.appendChild(document.createElementNS('http://www.w3.org/2000/svg', 'use'))
  useElement.setAttribute('href', `#${symbolName}`);

  const label = iconContainer.appendChild(document.createElement('label'));
  label.setAttribute('for', symbolName);
  label.innerText = symbolName;

  return iconContainer;
}

function handleFilterInput(event: KeyboardEvent) {
  const input = event.target as HTMLInputElement;
  if (event.code == "Escape")
    input.value = '';
  const re = new RegExp(`^.*${input.value}.*$`);
  const container = (document.getElementById('symbol-container') as Element);
  [...container.children].map(child =>
    (child as HTMLElement).style.display = re.test((child.id)) ? '' : 'none');
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
      svgElement.appendChild(node.cloneNode(true));
  })

  const xmlSerializer = new XMLSerializer();
  navigator.clipboard.writeText(xmlSerializer.serializeToString(xmlDocument))
    .then(() => {
      (document.getElementById('notify-container') as Element)
        .classList.add('notify-animate');
    })
}
