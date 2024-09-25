/**
 * Boost rendering and events framework for JavaScript
 * v 0.3.3
 */

export class App {

    constructor(selector) {

        // Main element
        this.element = document.querySelector(selector);

        // Event manager
        this.listeners = {};

        // Init event
        document.addEventListener('DOMContentLoaded', this.init.bind(this), {once: true});

        // URL router
        window.addEventListener('urlchange', event => {
            const newurl = new URL(window.location.href)
            const newparams = {};
            for (const [key, value] of newurl.searchParams.entries()) newparams[key] = value;
            this.router(newurl.pathname, newparams);
        });
        const url = new URL(window.location.href)
        const params = {};
        for (const [key, value] of url.searchParams.entries()) params[key] = value;
        this.router(url.pathname, params);
    }

    init() {
        /*** OVERLOAD ***/
    }

    append(component) {
        this.element.append(component.element);
    }

    router(path, params) {
        /*** OVERLOAD ***/
    }

}

export class Component {

    constructor(app, selector = null) {

        // Main app reference
        this.app = app;

        // Main element
        this.element = selector ? document.querySelector(selector) : document.createElement('div');

        // Changes observer
        const observer = new MutationObserver(async () => {
            observer.disconnect();
            await this.update();
        });
        observer.observe(this.element, {childList: true, subtree: true});

        // Reload event
        window.addEventListener('reload', this.update.bind(this));

        // Init
        this.init();
    }

    init() {
        /*** OVERLOAD ***/
    }

    append(component) {
        this.element.append(component.element);
    }

    async update() {
        /*** OVERLOAD ***/
    }

    on(id, type, fn) {
        this.app.listeners[id] = {type, fn: fn.bind(this), active: true};
        this.element.addEventListener(type, this.app.listeners[id].fn);
    }

    off(id) {
        const regexPattern = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
        const matches = Object.keys(this.app.listeners).filter(key => regexPattern.test(key));
        mathes.forEach(match => {
            this.element.removeEventListener(this.app.listeners[match].type, this.app.listeners[match].fn);
            delete this.app.listeners[id];
        });
    }

    url(path) {
        window.history.replaceState({}, '', path);
        window.dispatchEvent(new Event('urlchange'));
    }

}
