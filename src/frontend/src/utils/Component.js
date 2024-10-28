/**
 * Component v 0.7.2
 * Minimalistic DOM component for JavaScript
 * Copyright (C) 2024 Dariusz Dawidowski
 * Licence: MIT
 */

export class Component {

    /**
     * Constructor
     * args.type: DOM element e.g. 'div' (default), 'button', 'input'
     * args.html: html string to render
     * args.selector: dont create new element but assign to selector
     */

    constructor(args = {}) {

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

    }

    /**
     * Append child component
     */

    append(component) {
        this.element.append(component.element);
    }

    /**
     * Replace child component
     */

    replace(component) {
        this.element.replaceWith(component.element);
    }

}
