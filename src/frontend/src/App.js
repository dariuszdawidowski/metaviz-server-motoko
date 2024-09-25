import { backend } from 'declarations/backend';
import { App } from 'frontend/src/Boost.js';
import { Sidebar } from 'frontend/src/panels/Sidebar.js';

export default class MetavizApp extends App {

    init() {
    	this.sidebar = new Sidebar();
    	this.append(this.sidebar);
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
