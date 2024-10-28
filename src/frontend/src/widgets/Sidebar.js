import { Component } from 'frontend/src/utils/Component.js';
import { SidebarIcon } from 'frontend/src/widgets/SidebarIcon.js';


export class Sidebar extends Component {

    constructor() {
        super();
        this.element.classList.add('sidebar');
        this.element.innerHTML = `<a href="https://www.metaviz.net" target="_blank"><img src="/metaviz-mark-colorful.svg" width="38" height="38"></a>`;

        this.page = {
            '/dashboard/boards/': new SidebarIcon({
                id: 'icon-page-boards',
                icon: 'mdi mdi-bulletin-board',
                url: '/dashboard/boards/'
            }),
            '/dashboard/users/': new SidebarIcon({
                id: 'icon-page-users',
                icon: 'mdi mdi-account-multiple',
                url: '/dashboard/users/'
            }),
            '/dashboard/groups/': new SidebarIcon({
                id: 'icon-page-groups',
                icon: 'mdi mdi-shield-account',
                url: '/dashboard/groups/'
            })
        };
        Object.values(this.page).forEach(icon => this.append(icon));
    }

    select(url) {
        Object.values(this.page).forEach(icon => icon.deselect());
        this.page[url].select();
    }

}
