import { backend } from 'declarations/backend';
import { Component } from 'frontend/src/utils/Component.js';
import { Model } from 'frontend/src/utils/Model.js';
import { Topbar } from 'frontend/src/widgets/Topbar.js'
import { Addbox } from 'frontend/src/widgets/Addbox.js'
import { Box } from 'frontend/src/widgets/Box.js'


export class PageBoards extends Component {

    constructor(args) {
        super(args);
        this.fetch().then(() => this.build());
    }

    async fetch() {
        this.model = new Model({
            categories: await backend.getCategories(),
            boards: await backend.getBoards()
        });
    }

    async build() {
        // Topbar component
        this.topbar = new Topbar({text: `Your resources on x boards in x categories`});
        this.append(this.topbar);

        // Categories
        this.model.get('categories').forEach(category => {
            console.log('cat:', category);
            const box = new Box({
                title: '⇢ ' + category[1].name
            });
            // Boards
            this.model.get('boards').forEach(board => {
                console.log('board:', board);
                if (board[1].categoryKey === category[0]) {
                    const icon = new Component({
                        html: `
                            <a href="?board=${board[0]}" target="_blank" class="board-link-a" data-board="${board[0]}">
                                <div class="board-link">
                                    <div class="board-link-date">dd.mm</div>
                                    <div class="board-link-name">${board[1].name}</div>
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
                    const newBoard = await backend.addBoard(value, category[0]);
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
                const newCategory = await backend.addCategory(value);
            }
        });
        addCategoryBox.append(addCategory);

        this.element.querySelector('#topbar-summary').innerText = `Your resources on ${this.model.get('boards').length} boards in ${this.model.get('categories').length} categories`;

    }

}