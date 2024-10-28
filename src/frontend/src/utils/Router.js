/**
 * Router v 0.7.0
 * Minimalistic URL router for JavaScript
 * Copyright (C) 2024 Dariusz Dawidowski
 * Licence: MIT
 */

export class Router {

    constructor() {

        // URL change event handler
        window.addEventListener('urlchange', () => {
            const url = new URL(window.location.href)
            const params = {};
            for (const [key, value] of url.searchParams.entries()) params[key] = value;
            this.router(url.pathname, params);
        });

    }

    router(path, params) {
        /*** OVERLOAD ***/
    }

}
