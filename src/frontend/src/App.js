import { backend } from 'declarations/backend';
import { Router } from 'frontend/src/utils/Router.js';
import { PageBoards } from 'frontend/src/pages/Boards.js';

export default class MetavizApp extends Router {

    constructor(selector) {
        super();

        // Main element
        this.element = document.querySelector(selector);

        // Page component
        this.page = null;
    }    

    router(path, params) {

        switch (path) {
            case '/dashboard/boards/':
                this.page = new PageBoards();
                this.element.append(this.page.element);
                break;
            case '/dashboard/users/':
                break;
        }

    }

}
