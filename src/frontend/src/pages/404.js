import { Component } from 'frontend/src/utils/Component.js';

export class Page404 extends Component {

    constructor(args) {
        super({
            ...args,
            html: `
                <div class="panel">
                    <div class="midframe">
                        <img class="metaviz-logo" src="/metaviz-mark-colorful.svg" width="64" height="64" style="margin-bottom: 6px;">
                        <div class="info">404 - Page Not Found</div>
                    </div>
                </div>
            `
        });

    }

}