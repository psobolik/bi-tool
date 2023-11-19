import svgFile from '../images/bootstrap-icons.svg';

window.addEventListener('load', () => {
    document.querySelector(".footer").classList.add("in-view");
    document.getElementById('notify-container')
        .addEventListener('animationend', _evt => {
            document.getElementById('notify-container')
                .classList.remove('notify-animate');
    });
    setSelectContainerVisibility();
    document.getElementById('filter')
        .value = '';
    document.getElementById('copy-button')
        .addEventListener('click', handleCopy);
    document.getElementById('filter')
        .addEventListener('keyup', handleFilterInput);
    readSymbols(svgFile)
        .then(getSymbolIds)
        .then(appendSymbols)
})

function readSymbols(fileName) {
    return fetch(fileName)
        .then(result => {
            return result.text()
        })
        .then(parseSvg);
}

function parseSvg(text) {
    return new Promise(resolve => {
        const domParser = new DOMParser();
        resolve(domParser.parseFromString(text, "image/svg+xml"));
    })
}

function getSymbolIds(svg) {
    return new Promise(resolve => {
        const xpath = '//*[name()="symbol"]/@id';
        const xPathEvaluator = new XPathEvaluator();
        const expression = xPathEvaluator.createExpression(xpath);
        resolve(expression.evaluate(svg, XPathResult.ORDERED_NODE_ITERATOR_TYPE));
    })
}

function appendSymbols(symbolIds) {
    const container = document.getElementById('symbol-container');

    let symbolId = null;
    while ((symbolId = symbolIds.iterateNext())) {
        const el = container.appendChild(createSymbolElement(symbolId.value));
        el.addEventListener('click', evt => {
            selectSymbol(evt.target)
        });
    }
}

function getSelectedSymbolIds() {
    const result = [];
    const container = document.getElementById('select-icon-container');
    for (let i = 0; i < container.children.length; i++) {
        result.push(container.children[i].id);
    }
    return result;
}

function setSelectContainerVisibility() {
    const container = document.getElementById('select-container');
    if (getSelectedSymbolIds().length) {
        container.style.visibility = 'visible';
        container.style.height = 'auto';
    } else {
        container.style.visibility = 'hidden';
        container.style.height = '0';
    }
}

function selectSymbol(el) {
    while (!el.classList.contains('icon-container')) {
        el = el.parentElement;
    }
    const selected = getSelectedSymbolIds();
    if (!selected.includes(el.id)) {
        const container = document.getElementById('select-icon-container');
        el = container.appendChild(createSymbolElement(el.id));
        el.addEventListener('click', evt => {
            unselectSymbol(evt.target)
        })
    }
    setSelectContainerVisibility();
}

function unselectSymbol(el) {
    while (!el.classList.contains('icon-container')) {
        el = el.parentElement;
    }
    const container = document.getElementById('select-icon-container');
    container.removeChild(el);
    setSelectContainerVisibility();
}

function createSymbolElement(symbolName) {
    const iconContainer = document.createElement('div');
    iconContainer.classList.add('icon-container');
    iconContainer.id = symbolName;

    const svgContainer = iconContainer.appendChild(document.createElement('div'));
    svgContainer.classList.add('svg-container');

    const svg = svgContainer.appendChild(document.createElementNS('http://www.w3.org/2000/svg', 'svg'));
    svg.setAttribute('viewport', '0 0 16 16');

    const use = svg.appendChild(document.createElementNS('http://www.w3.org/2000/svg', 'use'))
    use.setAttribute('href', `${svgFile}#${symbolName}`);

    const label = iconContainer.appendChild(document.createElement('label'));
    label.setAttribute('for', symbolName);
    label.innerText = symbolName;

    return iconContainer;
}

function handleFilterInput(event) {
    function hideSymbols(pattern) {
        const re = new RegExp(`^.*${pattern}.*$`);
        const container = document.getElementById('symbol-container');
        for (let i = 0; i < container.children.length; i++) {
            const element = container.children[i];
            element.style.display = re.test((element.id)) ? '' : 'none';
        }
    }
    hideSymbols(event.target.value);
}

function handleCopy(_event) {
    function getSvgElement(svg, id) {
        const xpath = `//*[name()="symbol"][@id="${id}"]`;
        const xPathEvaluator = new XPathEvaluator();
        const expression = xPathEvaluator.createExpression(xpath);
        return expression.evaluate(svg, XPathResult.FIRST_ORDERED_NODE_TYPE);
    }

    const selected = getSelectedSymbolIds();
    if (selected.length <= 0) return;

    const svgElement = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svgElement.setAttribute('viewBox', `0 0 ${16 * selected.length} 16`);

    readSymbols(svgFile)
        .then(svg => {
            const xmlSerializer = new XMLSerializer();
            selected.forEach(id => {
                const el = getSvgElement(svg, id);
                svgElement.appendChild(el.singleNodeValue);
            })
            navigator.clipboard.writeText(xmlSerializer.serializeToString(svgElement))
                .then(() => {
                    document.getElementById('notify-container')
                        .classList.add('notify-animate');
                })
        })
}
/*
<symbol class="bi bi-1-circle-fill" viewBox="0 0 16 16" id="1-circle-fill">
    <path fill-rule="evenodd"
        d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0ZM9.283 4.002V12H7.971V5.338h-.065L6.072 6.656V5.385l1.899-1.383h1.312Z" />
</symbol>

<div class="icon-container">
    <div class="svg-container">
        <svg id="0-circle">
            <use href="./bootstrap-icons/bootstrap-icons.svg#0-circle-fill"/>
        </svg>
    </div>
    <label for="0-circle">0-circle</label>
</div>
*/
