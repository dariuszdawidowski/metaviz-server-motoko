import { Component } from '/src/utils/Component.js';


export class Topbar extends Component {

    constructor(args) {
        super({...
            args,
            html: `
                <div>
                    <div class="topbar">
                        <div id="topbar-summary">${args.text}</div>
                    </div>
                </div>
            `
        });

        if (process.env.METAVIZ_DEMO == 'true') {
            const demobar = document.createElement('div');
            demobar.classList.add('topbar');
            demobar.style.color = '#000';
            demobar.style.backgroundColor = '#eee';
            demobar.innerHTML = `
                <div><span class="mdi mdi-alert" style="font-size: 1.2em;"></span> This version is for testing and demonstration purposes only. Please do not store any important data here. Create your own canister for your organization instead.</div>
            `;
            this.element.append(demobar);
        }

    }

}
