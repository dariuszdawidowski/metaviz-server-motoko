/**
 * Boost rendering and events framework for JavaScript
 * v 0.3.0
 */

export class App {

    constructor(selector) {

        // Main element
        this.element = document.querySelector(selector);

        // Init event
        document.addEventListener('DOMContentLoaded', this.init.bind(this), {once: true});

        // URL router
        window.addEventListener('popstate', event => {
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

    constructor(selector = null) {

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


}
