import { backend } from 'declarations/backend';
import { Component } from 'frontend/src/utils/Component.js';
import { Database } from 'frontend/src/utils/Model.js';
import { Topbar } from 'frontend/src/widgets/Topbar.js'
import { Addbox } from 'frontend/src/widgets/Addbox.js'
import { Box } from 'frontend/src/widgets/Box.js'


export class PageBoards extends Component {

    constructor(args) {
        super(args);
        this.db = new Database();
        this.fetch().then(() => this.build());
    }

    async fetch() {
        this.db.add('categories', await backend.getCategories());
        this.db.add('boards', await backend.getBoards());
    }

    async build() {

        // Database observers
        this.db.table('categories').observer(() => console.log('category observer'));
        this.db.table('boards').observer(() => console.log('boards observer'));

        // Topbar component
        this.topbar = new Topbar({text: `Your resources on x boards in x categories`});
        this.append(this.topbar);

        // Categories
        this.db.table('categories').get().forEach(([categoryId, category]) => {

            // Category box
            const box = new Box({
                title: '⇢ ' + category.name
            });

            // Boards
            this.db.table('boards').get().forEach(([boardId, board]) => {
                if (board.categoryKey === categoryId) {
                    const icon = new Component({
                        html: `
                            <a href="?board=${boardId}" target="_blank" class="board-link-a" data-board="${boardId}">
                                <div class="board-link">
                                    <div class="board-link-date">dd.mm</div>
                                    <div class="board-link-name">${board.name}</div>
                                </div>
                            </a>
                        `
                    });
                    box.append(icon);
                }
            });
            this.append(box);

            // Add new board
            const addBoard = new Addbox({
                text: 'ADD NEW BOARD',
                placeholder: 'Board name',
                callback: async (value) => {
                    this.app.spinner.show();
                    const newBoard = await backend.addBoard(value, categoryId);
                    this.db.table('boards').append(newBoard);
                    this.app.spinner.hide();
                }
            });
            box.append(addBoard);
        });

        // Add new category
        const addCategoryBox = new Box();
        this.append(addCategoryBox);
        const addCategory = new Addbox({
            text: 'ADD NEW CATEGORY',
            placeholder: 'Category name',
            callback: async (value) => {
                this.app.spinner.show();
                const newCategory = await backend.addCategory(value);
                this.db.table('categories').append(newCategory);
                this.app.spinner.hide();
            }
        });
        addCategoryBox.append(addCategory);

        this.element.querySelector('#topbar-summary').innerText = `Your resources on ${this.db.table('boards').length} boards in ${this.db.table('categories').length} categories`;

    }

}