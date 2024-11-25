import { AuthClient } from '@dfinity/auth-client';
import { HttpAgent } from '@dfinity/agent';

import { createActor, backend } from 'declarations/backend';

import { Router } from 'frontend/src/utils/Router.js';
import { Spinner } from 'frontend/src/widgets/Spinner.js';
import { Dashboard } from 'frontend/src/pages/Dashboard.js';
import { PageLogin } from 'frontend/src/pages/Login.js';
import { PageRegister } from 'frontend/src/pages/Register.js';
import { Page404 } from 'frontend/src/pages/404.js';


export default class MetavizApp extends Router {

    constructor() {
        super();

        // Main elements
        this.main = document.querySelector('#app');
        this.dashboard = null;

        // IC connection
        this.actor = backend;
        this.authClient = null;
        this.identity = null;
        this.agent = null;

        // Spiner
        this.spinner = new Spinner();

        // Authorize and trigger the router first time
        this.auth().then(() => window.dispatchEvent(new Event('urlchange')));
    }

    /**
     * Route URL to method
     */

    router(path, params) {

        /* Redirect */

        // Login
        if (!this.isLoggedIn() && path == '/') {
            path = '/auth/login/';
            window.history.replaceState({}, '', path);
        }

        // Dashboard
        else if (this.isLoggedIn() && path == '/') {
            path = '/dashboard/boards/';
            window.history.replaceState({}, '', path);
        }

        /* Route */

        // Login
        if (path == '/auth/login/') {
            const login = new PageLogin({app: this});
            this.page(login);
        }

        // Register
        else if (path == '/auth/register/') {
            const register = new PageRegister({app: this});
            this.page(register);
        }

        // Logout
        else if (path == '/auth/logout/') {
            this.logoutII().then(() => this.url('/auth/login/'));
        }

        // Dashboard
        else if (path.startsWith('/dashboard/')) {
            if (!this.dashboard) {
                this.dashboard = new Dashboard({app: this});
            }
            this.page(this.dashboard);
            this.dashboard.set(path);
        }

        // 404
        else {
            const notFound = new Page404();
            this.page(notFound);
        }

    }

    /**
     * Render page component
     */

    page(component) {
        this.main.innerHTML = '';
        this.main.append(component.element);
    }

    /**
     * Switch URL
     */

    url(path) {
        window.history.replaceState({}, '', path);
        window.dispatchEvent(new Event('urlchange'));
    }

    /**
     * Authorize
     */

    async auth() {
        this.authClient = await AuthClient.create();
        if (await this.authClient.isAuthenticated()) {
            await this.loggedII();
        }
    }

    /**
     * User logged in
     */

    isLoggedIn() {
        return (this.identity && this.agent && this.actor);
    }

    /*** Internet Identity ***/

    async assignII() {
    }

    async loginII() {
        await new Promise((resolve) => {
            this.authClient.login({
                identityProvider: `http://${process.env.CANISTER_ID_INTERNET_IDENTITY}.localhost:${process.env.CANISTER_PORT}/`,
                onSuccess: resolve,
            });
        });
    }

    async loggedII() {
        this.identity = this.authClient.getIdentity();
        this.agent = await HttpAgent.create({ identity: this.identity });
        this.actor = createActor(process.env.CANISTER_ID_BACKEND, { agent: this.agent });
    }

    async logoutII() {
        await this.authClient.logout();
    }

    aboutII() {
        console.log('about II');
    }

    /*** NFID ***/

    async assignNFID() {
    }

    async loginNFID() {
    }

    async loggedNFID() {
    }

    async logoutNFID() {
    }

    aboutNFID() {
        console.log('about NFID');
    }

}
