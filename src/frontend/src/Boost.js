/**
 * Boost rendering and events framework for JavaScript
 * v 0.3.5
 */

export class App {

    constructor(selector) {

        // Main element
        this.element = document.querySelector(selector);

        // Event manager
        this.listeners = {};

        // Init event
        document.addEventListener(
            'DOMContentLoaded',
            () => {
                this.init();
                window.dispatchEvent(new Event('urlchange'));
            },
            {once: true}
        );

        // URL router
        window.addEventListener('urlchange', () => {
            const url = new URL(window.location.href)
            const params = {};
            for (const [key, value] of url.searchParams.entries()) params[key] = value;
            this.router(url.pathname, params);
        });
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

    on(pattern) {
        const regexPattern = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
        const matches = Object.keys(this.listeners).filter(key => regexPattern.test(key));
        matches.forEach(match => {
            this.listeners[match].element.addEventListener(this.listeners[match].type, this.listeners[match].fn);
        });
    }

    off(pattern) {
        const regexPattern = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
        const matches = Object.keys(this.listeners).filter(key => regexPattern.test(key));
        matches.forEach(match => {
            this.listeners[match].element.removeEventListener(this.listeners[match].type, this.listeners[match].fn);
        });
    }

    call(pattern) {
        const regexPattern = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
        const matches = Object.keys(this.listeners).filter(key => regexPattern.test(key));
        matches.forEach(match => {
            console.log(match)
            this.listeners[match].element.dispatchEvent(new Event(this.listeners[match].type));
        });
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
        this.app.listeners[id] = {type, fn: fn.bind(this), element: this.element};
        this.element.addEventListener(type, this.app.listeners[id].fn);
    }

    off(id) {
        this.element.removeEventListener(this.app.listeners[id].type, this.app.listeners[id].fn);
        delete this.app.listeners[id];
    }

    call(id) {
        this.element.dispatchEvent(new Event(id));
    }

    url(path) {
        window.history.replaceState({}, '', path);
        window.dispatchEvent(new Event('urlchange'));
    }

}
