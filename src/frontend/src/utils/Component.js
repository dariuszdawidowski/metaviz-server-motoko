/**
 * Component v 0.7.0
 * Minimalistic DOM component for JavaScript
 * Copyright (C) 2024 Dariusz Dawidowski
 * Licence: MIT
 */

export class Component {

    constructor(selector = null) {

        // Main element
        this.element = selector ? ((selector.startsWith('.') || selector.startsWith('#')) ? document.querySelector(selector) : document.createElement(selector)) : document.createElement('div');

    }

    append(component) {
        this.element.append(component.element);
    }

}
