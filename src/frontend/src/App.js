import { AuthClient } from '@dfinity/auth-client';
import { HttpAgent } from '@dfinity/agent';

import { createActor, backend } from 'declarations/backend';

import { Router } from 'frontend/src/utils/Router.js';
import { Component } from 'frontend/src/utils/Component.js';
import { Dashboard } from 'frontend/src/pages/Dashboard.js'
import { PageLogin } from 'frontend/src/pages/Login.js';
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
        this.auth();
    }

    router(path, params) {

        // Login
        if (path == '/auth/login/') {
            const login = new PageLogin({app: this});
            this.page(login);
        }

        // Logout
        else if (path == '/auth/logout/') {
            this.logoutII();
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

    page(component) {
        this.main.innerHTML = '';
        this.main.append(component.element);
    }

    url(path) {
        window.history.replaceState({}, '', path);
        window.dispatchEvent(new Event('urlchange'));
    }

    async auth() {
        this.authClient = await AuthClient.create();
        if (await this.authClient.isAuthenticated()) {
            this.loggedII();
        }
        else {
            this.url('/auth/login/');
        }
    }

    async loginII() {
        await new Promise((resolve) => {
            this.authClient.login({
                identityProvider: `http://${process.env.CANISTER_ID_INTERNET_IDENTITY}.localhost:8080/`,
                onSuccess: resolve,
            });
        });
        this.identity = this.authClient.getIdentity();
        this.agent = new HttpAgent({ identity: this.identity });
        this.actor = createActor(process.env.CANISTER_ID_BACKEND, { agent: this.agent });
        if (this.identity && this.agent && this.actor) this.url('/dashboard/boards/');
    }

    async loggedII() {
        this.identity = this.authClient.getIdentity();
        this.agent = new HttpAgent({ identity: this.identity });
        this.actor = createActor(process.env.CANISTER_ID_BACKEND, { agent: this.agent });
        if (this.identity && this.agent && this.actor) this.url('/dashboard/boards/');
    }

    async logoutII() {
        await this.authClient.logout();
        this.url('/auth/login/');
    }

    async loginNFID() {
    }

    async loggedNFID() {
    }

    async logoutNFID() {
    }

}
