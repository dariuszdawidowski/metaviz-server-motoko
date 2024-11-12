import { backend } from 'declarations/backend';
import { Component } from 'frontend/src/utils/Component.js';
import { Topbar } from 'frontend/src/widgets/Topbar.js'
import { Addbar } from 'frontend/src/widgets/Addbar.js'


export class PageBoards extends Component {

    constructor(args) {
        super(args);
    
        // Topbar component
        this.topbar = new Topbar({text: `Your resources on x boards in x categories`});
        this.append(this.topbar);

        // Add new category
        this.addCategory = new Addbar({
            text: 'ADD NEW CATEGORY',
            placeholder: 'Category name',
            callback: async (value) => {
                console.log('ADDING CATEGORY', value)
                await backend.addCategory(value);
            }
        });
        this.append(this.addCategory);

        // Update
        this.update();
    }

    async update() {
        const categories = await backend.getCategories();
        console.log('categories', categories)

        this.element.querySelector('#topbar-summary').innerText = `Your resources on y boards in y categories`;

    }

}