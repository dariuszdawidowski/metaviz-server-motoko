/**
 * Boost rendering and events framework for JavaScript
 * v 0.4.1
 */

export class App {

    constructor(selector) {

        // Main element
        this.element = document.querySelector(selector);

        // Event manager
        this.event = {

            // {'id pattern': {type, element, callback}, ...}
            listeners: {},

            on: (args) => {
                const regexPattern = new RegExp('^' + args.id.replace(/\*/g, '.*') + '$');
                const matches = Object.keys(this.event.listeners).filter(key => regexPattern.test(key));
                matches.forEach(match => {
                    console.log('ON:', match)
                    this.event.listeners[match].element.addEventListener(this.event.listeners[match].type, this.event.listeners[match].callback);
                });
            },
        
            off: (args) => {
                const regexPattern = new RegExp('^' + args.id.replace(/\*/g, '.*') + '$');
                const matches = Object.keys(this.event.listeners).filter(key => regexPattern.test(key));
                matches.forEach(match => {
                    console.log('OFF:', match)
                    this.event.listeners[match].element.removeEventListener(this.event.listeners[match].type, this.event.listeners[match].callback);
                });
            },
        
            call: (args) => {
                const regexPattern = new RegExp('^' + args.id.replace(/\*/g, '.*') + '$');
                const matches = Object.keys(this.event.listeners).filter(key => regexPattern.test(key));
                matches.forEach(match => {
                    console.log('CALL:', match)
                    this.event.listeners[match].element.dispatchEvent(new Event(this.event.listeners[match].type));
                });
            }
        };

        // Launch
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

}

export class Component {

    constructor(app, selector = null) {

        // Main app reference
        this.app = app;

        // Event support
        this.event = {

            on: (args) => {
                console.log('on:', args)
                if (args.id in this.app.event.listeners) console.error(`Conflicting events ${args.id}`)
                this.app.event.listeners[args.id] = {
                    type: ('type' in args ? args.type : null),
                    callback: args.callback.bind(this),
                    element: this.element
                };
                this.element.addEventListener('type' in args ? args.type : args.id, this.app.event.listeners[args.id].callback);
            },
        
            off: (args) => {
                console.log('off:', args)
                this.element.removeEventListener(this.app.event.listeners[args.id].type, this.app.event.listeners[args.id].callback);
                delete this.app.event.listeners[args.id];
            },
        
            call: (args) => {
                console.log('call:', args)
                this.element.dispatchEvent(new Event(args.id));
            }
        
        };

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

    }

    append(component) {
        this.element.append(component.element);
    }

    async update() {
        /*** OVERLOAD ***/
    }

    url(path) {
        window.history.replaceState({}, '', path);
        window.dispatchEvent(new Event('urlchange'));
    }

}
