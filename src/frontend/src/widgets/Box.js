import { Component } from 'frontend/src/utils/Component.js';
import { cleanString } from 'frontend/src/utils/Text.js';


export class Box extends Component {

    /**
     * Constructor
     * args.title: string - title for box
     */

    constructor(args) {
        super(args);

        const group = document.createElement('div');
        group.classList.add('group');
        this.element.append(group);

        const h1 = document.createElement('h1');
        h1.innerHTML = args.title;
        group.append(h1);

    }

    /**
     * Icon
     * args.body: string - icon HTML
     */

    icon(args) {
        

    }

}
