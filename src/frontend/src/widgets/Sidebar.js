import { Component } from 'frontend/src/utils/Component.js';
import { SidebarIcon } from 'frontend/src/widgets/SidebarIcon.js';


export class Sidebar extends Component {

    constructor() {
        super();
        this.element.classList.add('sidebar');
        this.element.innerHTML = `<a href="https://www.metaviz.net" target="_blank"><img src="/metaviz-mark-colorful.svg" width="38" height="38"></a>`;
        this.iconBoards = new SidebarIcon({id: 'icon-page-boards', icon: 'mdi mdi-bulletin-board', url: '/dashboard/boards/'});
        this.iconUsers = new SidebarIcon({id: 'icon-page-users', icon: 'mdi mdi-account-multiple', url: '/dashboard/users/'});
        this.iconBoards.select();
        this.append(this.iconBoards);
        this.append(this.iconUsers);
    }

}
