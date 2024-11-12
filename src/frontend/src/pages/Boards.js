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
        console.log('boards', boards)
        categories.forEach(category => {
            console.log('cat:', category);
            const box = new Box({
                title: '⇢ ' + category[1].name
            });
            const icon1 = new Component({
                html: `
                    <a href="?board={board.id}" target="_blank" class="board-link-a" data-board="{board.id}">
                        <div class="board-link">
                            <div class="board-link-date">dd.mm</div>
                            <div class="board-link-name">Name</div>
                        </div>
                    </a>
                `
            });
            box.append(icon1);
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