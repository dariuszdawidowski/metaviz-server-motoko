import { Component } from 'frontend/src/utils/Component.js';


export class PageUsers extends Component {

    constructor(args) {
        super({
            ...args,
            html: `<h1>Users</h1>`
        });
    }

}