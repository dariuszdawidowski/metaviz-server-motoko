import { Component } from '/src/utils/Component.js';

export class SidebarIcon extends Component {

    /**
     * Constructor
     * args.icon: icon class
     * args.url: destination url
     */

    constructor(args) {
        super(args);

        // Build
        this.element.classList.add('icon');
        this.element.dataset.url = args.url;
        this.element.innerHTML = `<span class="${args.icon}"></span>`;

        // Events
        this.element.addEventListener('click', () => {
            this.app.url(args.url);
        });
    }

    select() {
        this.element.classList.add('selected');
    }

    deselect() {
        this.element.classList.remove('selected');
    }

}
