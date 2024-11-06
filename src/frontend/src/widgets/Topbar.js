import { Component } from 'frontend/src/utils/Component.js';


export class Topbar extends Component {

    constructor(args) {
        super({...
            args,
            html: `
                <div>
                    <div class="topbar">
                        <div id="topbar-summary">${args.text}</div>
                    </div>
                    <div class="topbar" style="background-color: #eee; color: #000;">
                        <div><span class="mdi mdi-alert" style="font-size: 1.2em;"></span> This version is for testing and demonstration purposes only. Please do not store any important data here before opening the formal application.</div>
                    </div>
                </div>
            `
        });

    }

}
