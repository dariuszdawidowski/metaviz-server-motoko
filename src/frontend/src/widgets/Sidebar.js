import { Component } from '../utils/Component.js';


class Icon extends Component {

    constructor(args) {
        super();

        // Build
        this.element.id = args.id;
        this.element.classList.add('icon');
        this.element.dataset.url = args.url;
        this.element.innerHTML = `<span class="${args.icon}"></span>`;

        // Events
        // this.event.on({
        //     id: `sidebar:${this.element.id}`,
        //     type: 'click',
        //     callback: () => {
        //         this.url(this.element.dataset.url);
        //         this.app.event.call({id: `sidebar:clear:*`});
        //         this.select();
        //     }
        // });

        // this.event.on({
        //     id: `sidebar:clear:${this.element.id}`,
        //     callback: () => {
        //         console.log('CLR', this.element.id)
        //         this.deselect();
        //     }
        // });
    }

    select() {
        this.element.classList.add('selected');
    }

    deselect() {
        this.element.classList.remove('selected');
    }

}


export class Sidebar extends Component {

    constructor() {
        super();
        this.element.classList.add('sidebar');
        this.element.innerHTML = `<a href="https://www.metaviz.net" target="_blank"><img src="/metaviz-mark-colorful.svg" width="38" height="38"></a>`;
        this.iconBoards = new Icon({id: 'icon-page-boards', icon: 'mdi mdi-bulletin-board', url: '/dashboard/boards/'});
        this.iconUsers = new Icon({id: 'icon-page-users', icon: 'mdi mdi-account-multiple', url: '/dashboard/users/'});
        this.iconBoards.select();
        this.append(this.iconBoards);
        this.append(this.iconUsers);
    }

}
