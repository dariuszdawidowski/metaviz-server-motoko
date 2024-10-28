import { backend } from 'declarations/backend';
import { Router } from 'frontend/src/utils/Router.js';
import { Component } from 'frontend/src/utils/Component.js';
import { Sidebar } from 'frontend/src/widgets/Sidebar.js'
import { PageBoards } from 'frontend/src/pages/Boards.js';


class Dashboard extends Component {

    constructor(args) {
        super(args);

        // Sidebar component
        this.sidebar = new Sidebar();
        this.append(this.sidebar);

        // Content empty container
        this.content = new Component();
        this.append(this.content);
    }

    set(component) {
        this.content.replace(component);
    }

}


export default class MetavizApp extends Router {

    constructor() {
        super();

        // Main element
        this.dashboard = null;
    }    

    router(path, params) {

        // Lazy create dashboard
        if (path.startsWith('/dashboard/') && !this.dashboard) {
            this.dashboard = new Dashboard({ selector: '#app' });
        }

        // URLs
        switch (path) {
            case '/dashboard/boards/':
                this.dashboard.set(new PageBoards());
                break;
            case '/dashboard/users/':
                // this.dashboard.set(new PageUsers());
                break;
        }

    }

}
