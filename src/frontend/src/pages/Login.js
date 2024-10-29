import { Component } from 'frontend/src/utils/Component.js';
import { createActor, backend } from "declarations/backend";
import { AuthClient } from "@dfinity/auth-client"
import { HttpAgent } from "@dfinity/agent";

export class PageLogin extends Component {

    constructor() {
        super({
            html: `
                <div class="panel">
                    <div class="midframe">
                        <img class="metaviz-logo" src="/metaviz-mark-colorful.svg" width="64" height="64" style="margin-bottom: 6px;">
                        <div class="info">Select a login method:</div>
                        <div class="login-buttons">
                            <button id="login-ii">
                                <img src="/ICP.svg" width="40" style="margin-right: 10px">
                                Sign in using Internet Identity
                            </button>
                            <span id="about-ii" class="mdi mdi-information" title="What is it?"></span>
                        </div>
                        <div class="login-buttons">
                            <button id="login-nfid">
                                <img src="/NFID.avif" width="22" style="margin-left: 10px; margin-right: 17px;">
                                Sign in using NFID
                            </button>
                            <span id="about-nfid" class="mdi mdi-information" title="What is it?"></span>
                        </div>
                    </div>
                </div>
            `
        });

        this.element.querySelector('#login-ii').addEventListener('click', () => {
            this.loginII();
        });

        this.element.querySelector('#about-ii').addEventListener('click', () => {
            this.aboutII();
        });

        this.element.querySelector('#login-nfid').addEventListener('click', () => {
            this.loginNFID();
        });

        this.element.querySelector('#about-nfid').addEventListener('click', () => {
            this.aboutNFID();
        });
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

    aboutII() {
        console.log('about II');
    }

    loginNFID() {
        console.log('login NFID');
    }

    aboutNFID() {
        console.log('about NFID');
    }

}