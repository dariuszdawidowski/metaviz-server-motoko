/**
 * Widget: Generic container without appearance
 */

import { Component } from '/src/utils/Component.js';

export class Container extends Component {

    /**
     * Constructor
     * args.direction: string - 'horizontal' | 'vertical'
     */

    constructor(args = {}) {
        super(args);

        this.element.classList.add('container');
        if (('direction' in args)) this.element.classList.add(args.direction);

    }

}
