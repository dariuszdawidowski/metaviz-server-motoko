/**
 * Widget: Icon to display a user on the list
 */

import { Component } from 'frontend/src/utils/Component.js';


export class UserIcon extends Component {

    constructor(args) {
        super({...
            args,
            html: `
                <div class="user-icon" data-user="${args.id}">
                    <span class="mdi mdi-account"></span>
                    <div class="user-name">${args.name}</div>
                </div>
            `
        });

    }

}
