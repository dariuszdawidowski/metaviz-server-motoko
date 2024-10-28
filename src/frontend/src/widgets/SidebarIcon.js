import { Component } from 'frontend/src/utils/Component.js';


export class SidebarIcon extends Component {

    constructor(args) {
        super();

        // Build
        this.element.id = args.id;
        this.element.classList.add('icon');
        this.element.dataset.url = args.url;
        this.element.innerHTML = `<span class="${args.icon}"></span>`;

        // Events
        // this.event.on({
        //     id: `sidebar:${this.element.id}`,
        //     type: 'click',
        //     callback: () => {
        //         this.url(this.element.dataset.url);
        //         this.app.event.call({id: `sidebar:clear:*`});
        //         this.select();
        //     }
        // });

        // this.event.on({
        //     id: `sidebar:clear:${this.element.id}`,
        //     callback: () => {
        //         console.log('CLR', this.element.id)
        //         this.deselect();
        //     }
        // });
    }

    select() {
        this.element.classList.add('selected');
    }

    deselect() {
        this.element.classList.remove('selected');
    }

}
