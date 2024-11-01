import { Component } from 'frontend/src/utils/Component.js';


export class Dashboard extends Component {

    constructor(args) {
        super(args);

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
