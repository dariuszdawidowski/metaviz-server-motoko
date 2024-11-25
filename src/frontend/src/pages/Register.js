import { Component } from 'frontend/src/utils/Component.js';

export class PageRegister extends Component {

    constructor(args) {
        super({
            ...args,
            html: `
                <div class="panel">
                    <div class="midframe">
                        <img class="metaviz-logo" src="/metaviz-mark-colorful.svg" width="64" height="64" style="margin-bottom: 6px;">
                        <div class="info">Assign your user to one of the following login methods:</div>
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
            this.app.assignII();
        });

        this.element.querySelector('#about-ii').addEventListener('click', () => {
            this.app.aboutII();
        });

        this.element.querySelector('#login-nfid').addEventListener('click', () => {
            this.app.assignNFID();
        });

        this.element.querySelector('#about-nfid').addEventListener('click', () => {
            this.app.aboutNFID();
        });
    }

}