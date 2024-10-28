import { backend } from 'declarations/backend';
import { Router } from 'frontend/src/utils/Router.js';
import { Sidebar } from 'frontend/src/widgets/Sidebar.js';

export default class MetavizApp extends Router {

    constructor(selector) {
    	super();

        // Main element
        this.element = document.querySelector(selector);

        // Create components
    	this.sidebar = new Sidebar(this);
        this.element.append(this.sidebar.element);
	}    

    router(path, params) {
    	console.log('router', path, params)

    	switch (path) {
	    	case '/dashboard/boards/':
	    		// this.right.append(new Boards());
	    		break;
	    	case '/dashboard/users/':
	    		// this.right.append(new Users());
	    		break;
    	}

    }

}
