import { Component } from '/src/utils/Component.js';
import { MetavizClientIC } from '/src/metaviz-client-ic/app/metaviz-client-ic.js';

export class Editor extends Component {

    constructor(args) {
        super(args);
        metaviz = new MetavizClientIC(args.app);
        metaviz.build = document.querySelector('meta[name="metaviz:build:version"]')?.content;
        global.cache['MetavizNodeImage'] = {
            formats: ['image/jpeg', 'image/png', 'image/apng', 'image/gif', 'image/webp', 'image/x-icon', 'image/svg+xml'],
            extensions: ['jpg', 'jpeg', 'png', 'apng', 'gif', 'webp', 'ico', 'svg'],
            miniatures: ['image/jpeg', 'image/png'],
            minWidth: 512
        };
        global.cache['MetavizNodeFile'] = {
            maxSize: 32 * 1024 * 1024 // 32 MB (max dropped image file size)
        };
        if (metaviz.compatibilityTest()) {
            metaviz.init('metaviz-diagram', 'metaviz-spinner');
            metaviz.start();
        }
        else {
            alert(_('Unsupported browser'));
        }
    
    }

}
