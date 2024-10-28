import { Component } from 'frontend/src/utils/Component.js';


export class PageBoards extends Component {

    constructor(args) {
        super({
            html: `
                <div style="width: 100%; height: 100%; display: flex; flex-direction: row;">
                    <div id="boards" class="right"></div>
                </div>
            `
        });
    }

}