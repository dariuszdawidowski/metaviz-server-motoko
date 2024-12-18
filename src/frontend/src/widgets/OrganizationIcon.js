/**
 * Widget: Icon to display an organization header
 */

import { Component } from '/src/utils/Component.js';

export class OrganizationIcon extends Component {

    constructor(args) {
        super({...
            args,
            html: `
                <h1><span class="mdi mdi-domain"></span> ${args.name}</h1>
            `
        });

    }

}
