import { backend } from 'declarations/backend';
import { Router } from 'frontend/src/utils/Router.js';
import { Component } from 'frontend/src/utils/Component.js';
import { Sidebar } from 'frontend/src/widgets/Sidebar.js'
import { PageBoards } from 'frontend/src/pages/Boards.js';
import { PageGroups } from 'frontend/src/pages/Groups.js';
import { PageUsers } from 'frontend/src/pages/Users.js';


class Dashboard extends Component {

    constructor() {
        super();

        // Classes
        this.element.classList.add('dashboard');

        // Sidebar component
        this.sidebar = new Sidebar();
        this.append(this.sidebar);

        // Content empty container
        this.content = new Component();
        this.append(this.content);

        // Active content page
        this.page = null;
    }

    set(path) {
        this.sidebar.select(path);

        switch (path) {
            case '/dashboard/boards/':
                this.page = new PageBoards();
                this.content.replace(this.page);
                break;
            case '/dashboard/users/':
                this.page = new PageUsers();
                this.content.replace(this.page);
                break;
            case '/dashboard/groups/':
                this.page = new PageGroups();
                this.content.replace(this.page);
                break;
        }
    }

}


export default class MetavizApp extends Router {

    constructor() {
        super();

        // Main elements
        this.main = document.querySelector('#app');
        this.dashboard = null;
    }    

    router(path, params) {

        // Dashboard
        if (path.startsWith('/dashboard/')) {
            if (!this.dashboard) {
                this.dashboard = new Dashboard();
                this.main.append(this.dashboard.element);
            }
            this.dashboard.set(path);
        }

    }

}
