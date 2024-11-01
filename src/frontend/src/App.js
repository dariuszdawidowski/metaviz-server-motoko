import { AuthClient } from '@dfinity/auth-client';
import { HttpAgent } from '@dfinity/agent';

import { createActor, backend } from 'declarations/backend';

import { Router } from 'frontend/src/utils/Router.js';
import { Component } from 'frontend/src/utils/Component.js';
import { Sidebar } from 'frontend/src/widgets/Sidebar.js'
import { Dashbaord } from 'frontend/src/pages/Dashboard.js'
import { PageBoards } from 'frontend/src/pages/Boards.js';
import { PageGroups } from 'frontend/src/pages/Groups.js';
import { PageLogin } from 'frontend/src/pages/Login.js';
import { PageUsers } from 'frontend/src/pages/Users.js';


export default class MetavizApp extends Router {

    constructor() {
        super();

        // Main elements
        this.main = document.querySelector('#app');
        this.dashboard = null;
    }    

    router(path, params) {

        // Authorization
        if (path == '/auth/login/') {
            const login = new PageLogin({app: this});
            this.main.append(login.element);
        }

        // Dashboard
        else if (path.startsWith('/dashboard/')) {
            if (!this.dashboard) {
                this.dashboard = new Dashboard({app: this});
                this.main.append(this.dashboard.element);
            }
            this.dashboard.set(path);
        }

    }

    url(path) {
        window.history.replaceState({}, '', path);
        window.dispatchEvent(new Event('urlchange'));
    }

    async loginII() {
        let actor = backend;
        let authClient = await AuthClient.create();
        await new Promise((resolve) => {
            authClient.login({
                identityProvider: `http://${process.env.CANISTER_ID_INTERNET_IDENTITY}.localhost:8080/`,
                onSuccess: resolve,
            });
        });
        const identity = authClient.getIdentity();
        const agent = new HttpAgent({identity});
        actor = createActor(process.env.CANISTER_ID_BACKEND, {
            agent,
        });
        console.log('login II', identity, agent, actor);
    }

    loginNFID() {
        console.log('login NFID');
    }

}
