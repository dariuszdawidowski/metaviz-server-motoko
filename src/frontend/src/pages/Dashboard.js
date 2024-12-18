import { Component } from '/src/utils/Component.js';
import { PageBoards } from '/src/pages/Boards.js';
import { PageGroups } from '/src/pages/Groups.js';
import { PageUsers } from '/src/pages/Users.js';
import { PageSettings } from '/src/pages/Settings.js';
import { Page404 } from '/src/pages/404.js';
import { Sidebar } from '/src/widgets/Sidebar.js'

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
        this.content.element.classList.add('right');
        this.append(this.content);

        // Active content page
        this.page = null;
    }

    set(path) {
        this.sidebar.select(path);

        switch (path) {
            case '/dashboard/boards/':
                this.page = new PageBoards({app: this.app});
                this.content.replace(this.page);
                break;
            case '/dashboard/users/':
                this.page = new PageUsers({app: this.app});
                this.content.replace(this.page);
                break;
            case '/dashboard/groups/':
                this.page = new PageGroups({app: this.app});
                this.content.replace(this.page);
                break;
            case '/dashboard/settings/':
                this.page = new PageSettings({app: this.app});
                this.content.replace(this.page);
                break;
                default:
                this.page = new Page404({app: this.app});
                this.content.replace(this.page);
        }
    }

}
