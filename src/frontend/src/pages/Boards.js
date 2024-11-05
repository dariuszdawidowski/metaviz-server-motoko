import { Component } from 'frontend/src/utils/Component.js';
import { Topbar } from 'frontend/src/widgets/Topbar.js'


export class PageBoards extends Component {

    constructor(args) {
        super(args);
    
        // Topbar component
        // this.topbar = new Topbar({text: `Your resources on ${boards.length} boards in ${categories.length} categories`});
        this.topbar = new Topbar({text: `Your resources on ${1} boards in ${2} categories`});
        this.append(this.topbar);
    }

}