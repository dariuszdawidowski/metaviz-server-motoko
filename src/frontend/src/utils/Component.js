/**
 * Component v 0.7.1
 * Minimalistic DOM component for JavaScript
 * Copyright (C) 2024 Dariusz Dawidowski
 * Licence: MIT
 */

export class Component {

    /**
     * Constructor
     * args.type: DOM element e.g. 'div' (default), 'button', 'input'
     * args.html: html string to render
     */

    constructor(args) {

        // Main DOM element
        this.element = null;

        // Render html string into DOM
        if (args.html !== undefined) {
            const parser = new DOMParser();
            const doc = parser.parseFromString(args.html, 'text/html');
            this.element = doc.body.firstChild;

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

}
