import { Component } from 'frontend/src/utils/Component.js';
import { PageBoards } from 'frontend/src/pages/Boards.js';
import { PageGroups } from 'frontend/src/pages/Groups.js';
import { PageUsers } from 'frontend/src/pages/Users.js';
import { Page404 } from 'frontend/src/pages/404.js';
import { Sidebar } from 'frontend/src/widgets/Sidebar.js'


export class Dashboard extends Component {

    constructor(args) {
        super(args);

        // Classes
        this.element.classList.add('dashboard');

        // Sidebar component
        this.sidebar = new Sidebar({app: args.app});
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
            default:
                this.page = new Page404();
                this.content.replace(this.page);
        }
    }

}
