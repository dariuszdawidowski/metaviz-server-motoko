import { Component } from '/src/utils/Component.js';
import { Topbar } from '/src/widgets/Topbar.js';
import { Box } from '/src/widgets/Box.js';

export class PageSettings extends Component {

    constructor(args) {
        super(args);
        this.build();
    }

    /**
     * Build components
     */

    build() {

        // Topbar component
        this.topbar = new Topbar({text: `User Principal ID: ${this.app.auth.getIdentity().getPrincipal()}`});
        this.append(this.topbar);

        // Settings box
        const box = new Box({ title: '⇢ Settings' });
        this.append(box);
    }

}
