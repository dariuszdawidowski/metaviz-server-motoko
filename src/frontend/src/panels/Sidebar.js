import { Component } from '../Boost.js';

export class Sidebar extends Component {

    init() {
        this.element.classList.add('sidebar');
        this.element.innerHTML = `
            <a href="https://www.metaviz.net" target="_blank"><img src="/metaviz-mark-colorful.svg" width="50" height="50"></a>
            <div id="icon-page-boards" class="icon"><span class="mdi mdi-bulletin-board"></span></div>
            <div id="icon-page-users" class="icon"><span class="mdi mdi-account-multiple"></span></div>
        `;
    }

};
