import { Component } from '/src/utils/Component.js';
import { SidebarIcon } from '/src/widgets/SidebarIcon.js';

export class Sidebar extends Component {

    constructor(args) {
        super(args);

        this.element.classList.add('sidebar');
        this.element.innerHTML = `<a href="https://www.metaviz.net" target="_blank"><img src="/metaviz-mark-colorful.svg" width="38" height="38"></a>`;

        this.page = {
            '/dashboard/boards/': new SidebarIcon({
                app: args.app,
                icon: 'mdi mdi-bulletin-board',
                url: '/dashboard/boards/'
            }),
            '/dashboard/users/': new SidebarIcon({
                app: args.app,
                icon: 'mdi mdi-account-multiple',
                url: '/dashboard/users/'
            }),
            '/dashboard/groups/': new SidebarIcon({
                app: args.app,
                icon: 'mdi mdi-shield-account',
                url: '/dashboard/groups/'
            }),
            '/dashboard/settings/': new SidebarIcon({
                app: args.app,
                icon: 'mdi mdi-cog',
                url: '/dashboard/settings/'
            }),
            '/auth/logout/': new SidebarIcon({
                app: args.app,
                id: 'icon-page-logout',
                icon: 'mdi mdi-logout-variant',
                url: '/auth/logout/'
            })
        };
        Object.values(this.page).forEach(icon => this.append(icon));
    }

    select(url) {
        Object.values(this.page).forEach(icon => icon.deselect());
        this.page[url].select();
    }

}
