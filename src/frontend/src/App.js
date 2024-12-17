import { AuthClient } from '@dfinity/auth-client';
import { HttpAgent } from '@dfinity/agent';

import { createActor, backend } from 'declarations/backend';

import { Router } from 'frontend/src/utils/Router.js';
import { Spinner } from 'frontend/src/widgets/Spinner.js';
import { Dashboard } from 'frontend/src/pages/Dashboard.js';
import { Editor } from 'frontend/src/pages/Editor.js';
import { PageLogin } from 'frontend/src/pages/Login.js';
import { PageRegister } from 'frontend/src/pages/Register.js';
import { Page404 } from 'frontend/src/pages/404.js';


export default class MetavizApp extends Router {

    constructor() {
        super();

        // Main elements
        this.main = document.querySelector('#app');
        this.dashboard = null;
        this.editor = null;

        // IC connection
        this.actor = backend;
        this.auth = null;
        this.identity = null;
        this.agent = null;

        // Spiner
        this.spinner = new Spinner();

        // Authorize and trigger the router first time
        this.authorize().then(() => window.dispatchEvent(new Event('urlchange')));
    }

    /**
     * Route URL to method
     */

    router(path, params) {

        /* Redirect */

        // Login
        if (!this.isLoggedIn()) {
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
            const register = new PageRegister({app: this, user: params.user, token: params.token});
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

        // Metaviz editor
        else if (path.startsWith('/editor/')) {
            if (!this.editor) {
                this.editor = new Editor({app: this});
            }
            this.page(this.editor);
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

    async authorize() {
        this.auth = await AuthClient.create();
        if (await this.auth.isAuthenticated()) {
            await this.loggedII();
        }
    }

    /**
     * User logged in
     */

    isLoggedIn() {
        return this.auth && this.auth.getIdentity() && !this.auth.getIdentity().getPrincipal().isAnonymous();
    }

    /*** Internet Identity ***/

    async assignII(userId, token) {
        this.spinner.show();
        const principal = await this.actor.assignUser(userId, token);
        this.spinner.hide();
    }

    async loginII() {
        await new Promise((resolve) => {
            this.auth.login({
                identityProvider: this.getIIURL(),
                onSuccess: resolve,
            });
        });
    }

    async loggedII() {
        this.identity = this.auth.getIdentity();
        this.agent = await HttpAgent.create({ identity: this.identity });
        this.actor = createActor(process.env.CANISTER_ID_BACKEND, { agent: this.agent });
    }

    async logoutII() {
        await this.auth.logout();
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

    /*** Get URLs ***/

    getFrontendURL() {
        return `http://${process.env.CANISTER_ID_FRONTEND}.localhost:${process.env.CANISTER_PORT}`;
    }

    getIIURL() {
        return `http://${process.env.CANISTER_ID_INTERNET_IDENTITY}.localhost:${process.env.CANISTER_PORT}`;
    }

}
