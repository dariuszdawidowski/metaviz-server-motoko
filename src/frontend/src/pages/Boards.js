import { Component } from 'frontend/src/utils/Component.js';
import { Sidebar } from 'frontend/src/widgets/Sidebar.js'


export class PageBoards extends Component {

    constructor(args) {
        super({
            html: `<div style="width: 100%; height: 100%; display: flex; flex-direction: row;"></div>`
        });

        this.sidebar = new Sidebar();
        this.append(this.sidebar);
    }

}