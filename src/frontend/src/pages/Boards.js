import { Component } from 'frontend/src/utils/Component.js';


export class PageBoards extends Component {

    constructor(args) {
        super({
            ...args,
            html: `<h1>Boards</h1>`
        });
    }

}