/**
 * Component v 0.8.0
 * Minimalistic DOM component for JavaScript
 * Copyright (C) 2024 Dariusz Dawidowski
 * Licence: MIT
 */

export class Component {

    /**
     * Constructor
     * args.app: reference to the main app object (optional)
     * args.id: id for the DOM element (optional)
     * args.type: DOM element e.g. 'div' (default), 'button', 'input' (optional)
     * args.html: html string to render (optional)
     * args.selector: dont create new element but assign to selector (optional)
     */

    constructor(args = {}) {

        // App reference
        this.app = ('app' in args) ? args.app : null;

        // Main DOM element
        this.element = null;

        // Render html string into DOM
        if (args.html !== undefined) {
            const parser = new DOMParser();
            const doc = parser.parseFromString(args.html, 'text/html');
            this.element = doc.body.firstChild;

        }

        // Assign to selector
        else if (args.selector !== undefined) {
            this.element = document.querySelector(args.selector);
        }

        // Create DOM element
        else {
            this.element = document.createElement((args.type !== undefined) ? args.type : 'div');
        }

        // ID
        if (args.id !== undefined) {
            this.element.id = args.id;
        }

        // Use MutationObserver to detect when the element is added to the DOM
        const observer = new MutationObserver((mutationsList, observer) => {
            for (const mutation of mutationsList) {
                if (mutation.type === 'childList') {
                    for (const node of mutation.addedNodes) {
                        if (node === this.element) {
                            this.mount();
                            this.update();
                            observer.disconnect();
                            break;
                        }
                    }
                }
            }
        });
        observer.observe(document.body, { childList: true, subtree: true });
        
    }

    /**
     * Append child component
     * @param component: child Component
     */

    append(component) {
        this.element.append(component.element);
    }

    /**
     * Replace child component
     * @param component: child Component
     */

    replace(component) {
        this.element.innerHTML = '';
        this.element.append(component.element);
    }

    /**
     * On mount callback
     */

    mount() {
        /* Override */
    }

    /**
     * Update DOM
     */

    update() {
        /* Override */
    }

}
