/**
 * Widget: Icon to display a board on the list
 */

import { Component } from 'frontend/src/utils/Component.js';


export class BoardIcon extends Component {

    constructor(args) {
        super({...
            args,
            html: (('type' in args) && args.type == 'assigned') ? `
                <div class="board-icon" data-board="${args.id}">
                    <span class="mdi mdi-bulletin-board"></span>
                    <div class="user-name">${args.name}</div>
                </div>
            ` : `
                <a href="?board=${args.id}" target="_blank" class="board-link-a" data-board="${args.id}">
                    <div class="board-link">
                        <div class="board-link-date">${args.date}</div>
                        <div class="board-link-name">${args.name}</div>
                    </div>
                </a>
            `
        });

    }

}
