import { Component } from '../Boost.js';


class Icon extends Component {

    constructor(app, args) {
        super(app, null);
        this.element.id = args.id;
        this.element.classList.add('icon');
        this.element.dataset.url = args.url;
        this.element.innerHTML = `<span class="${args.icon}"></span>`;
    }

    init() {
        this.on(`dashboard:sidebar:click:${this.element.id}`, 'click', () => {
            this.url(this.element.dataset.url);
            this.app.call('dashboard:sidebar:clear:*');
            this.select();
        });
        this.on(`dashboard:sidebar:clear:${this.element.id}`, 'clear', () => {
            console.log('CLR', this.element.id)
            this.deselect();
        });
    }

    select() {
        this.element.classList.add('selected');
    }

    deselect() {
        this.element.classList.remove('selected');
    }

}


export class Sidebar extends Component {

    init() {
        this.element.classList.add('sidebar');
        this.element.innerHTML = `<a href="https://www.metaviz.net" target="_blank"><img src="/metaviz-mark-colorful.svg" width="38" height="38"></a>`;
        this.iconBoards = new Icon(this.app, {id: 'icon-page-boards', icon: 'mdi mdi-bulletin-board', url: '/dashboard/boards/'});
        this.iconUsers = new Icon(this.app, {id: 'icon-page-users', icon: 'mdi mdi-account-multiple', url: '/dashboard/users/'});
        this.iconBoards.select();
        this.append(this.iconBoards);
        this.append(this.iconUsers);
    }

};
