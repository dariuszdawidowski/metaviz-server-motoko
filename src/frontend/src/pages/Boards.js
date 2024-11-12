import { backend } from 'declarations/backend';
import { Component } from 'frontend/src/utils/Component.js';
import { Topbar } from 'frontend/src/widgets/Topbar.js'
import { Addbox } from 'frontend/src/widgets/Addbox.js'
import { Box } from 'frontend/src/widgets/Box.js'


export class PageBoards extends Component {

    constructor(args) {
        super(args);
    
        // Topbar component
        this.topbar = new Topbar({text: `Your resources on x boards in x categories`});
        this.append(this.topbar);

        // Update
        this.render();
    }

    async render() {
        const categories = await backend.getCategories();
        const boards = await backend.getBoards();
        console.log(boards)
        categories.forEach(category => {
            console.log(category);
            const box = new Box({
                title: '⇢ ' + category[1].name
            });
            this.append(box);
        });

        // Add new category
        this.addCategory = new Addbox({
            text: 'ADD NEW CATEGORY',
            placeholder: 'Category name',
            callback: async (value) => {
                const newCategory = await backend.addCategory(value);
            }
        });
        this.append(this.addCategory);

        this.element.querySelector('#topbar-summary').innerText = `Your resources on y boards in ${categories.length} categories`;

    }

}