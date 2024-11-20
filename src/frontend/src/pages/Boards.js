import { backend } from 'declarations/backend';
import { Component } from 'frontend/src/utils/Component.js';
import { Addbox } from 'frontend/src/widgets/Addbox.js'
import { Box } from 'frontend/src/widgets/Box.js'
import { BoardIcon } from 'frontend/src/widgets/BoardIcon.js'
import { Container } from 'frontend/src/widgets/Container.js'
import { Topbar } from 'frontend/src/widgets/Topbar.js'


export class PageBoards extends Component {

    constructor(args) {
        super(args);
        this.fetch().then(() => this.build());
    }

    async fetch() {
        this.db = {
            categories: await backend.getCategories(),
            boards: await backend.getBoards()
        };
    }

    async build() {

        // Topbar component
        this.topbar = new Topbar({text: `Your resources on x boards in x categories`});
        this.append(this.topbar);

        // Categories
        this.db.categories.forEach(([categoryId, category]) => {

            // Category box
            const box = new Box({ title: '⇢ ' + category.name });

            // Pocket for boards
            const boards = new Container({ direction: 'horizontal' });
            box.append(boards);

            // Boards
            this.db.boards.forEach(([boardId, board]) => {
                if (board.categoryKey === categoryId) {
                    const icon = new BoardIcon({
                        id: boardId,
                        name: board.name,
                        date: '00.00'
                    });
                    boards.append(icon);
                }
            });
            this.append(box);

            // Add new board
            const addBoard = new Addbox({
                text: 'ADD NEW BOARD',
                placeholder: 'Board name',
                callback: async (value) => {
                    await this.addNewBoard(boards, value, categoryId);
                }
            });
            box.append(addBoard);
        });

        // Pocket for new categories
        const categories = new Container();
        this.append(categories);

        // Add new category
        const addCategoryBox = new Box();
        this.append(addCategoryBox);
        const addCategory = new Addbox({
            text: 'ADD NEW CATEGORY',
            placeholder: 'Category name',
            callback: async (value) => {
                await this.addNewCategory(categories, value);
            }
        });
        addCategoryBox.append(addCategory);

        this.element.querySelector('#topbar-summary').innerText = `Your resources on ${Object.keys(this.db.boards).length} boards in ${Object.keys(this.db.categories).length} categories`;

    }

    async addNewCategory(parent, name) {
        this.app.spinner.show();
        const newCategory = await backend.addCategory(name);
        // New category box
        const newCategoryBox = new Box({ title: '⇢ ' + newCategory[1].name });
        // Pocket for boards
        const boards = new Container({ direction: 'horizontal' });
        newCategoryBox.append(boards);
        // + Add board
        const addBoard = new Addbox({
            text: 'ADD NEW BOARD',
            placeholder: 'Board name',
            callback: async (value) => {
                await this.addNewBoard(boards, value, newCategory[0]);
            }
        });
        newCategoryBox.append(addBoard);
        parent.append(newCategoryBox);
        this.app.spinner.hide();
    }

    async addNewBoard(parent, name, categoryId) {
        this.app.spinner.show();
        const newBoard = await backend.addBoard(name, categoryId);
        const icon = new BoardIcon({
            id: newBoard[0][0],
            name: newBoard[0][1].name,
            date: '00.00'
        });
        parent.append(icon);
        this.app.spinner.hide();
    }

}