import { Component } from '/src/utils/Component.js';

export class Box extends Component {

    /**
     * Constructor
     * args.title: string - title for box
     */

    constructor(args = {}) {
        super(args);

        this.element.classList.add('group');

        if ('title' in args) {
            const h1 = document.createElement('h1');
            h1.innerHTML = args.title;
            this.element.append(h1);
        }

    }

}
