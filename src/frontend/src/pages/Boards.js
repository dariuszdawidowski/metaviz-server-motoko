import { Component } from 'frontend/src/utils/Component.js';
import { Addbox } from 'frontend/src/widgets/Addbox.js';
import { Box } from 'frontend/src/widgets/Box.js';
import { BoardIcon } from 'frontend/src/widgets/BoardIcon.js';
import { Container } from 'frontend/src/widgets/Container.js';
import { Topbar } from 'frontend/src/widgets/Topbar.js';


export class PageBoards extends Component {

    constructor(args) {
        super(args);
        this.fetch().then(() => this.build());
    }

    async fetch() {
        this.db = {
            categories: await this.app.actor.getCategories(),
            boards: await this.app.actor.getBoards()
        };
    }

    async build() {

        // Topbar component
        this.topbar = new Topbar({text: `Your resources on x boards in x categories`});
        this.append(this.topbar);

        // Pocket for new categories
        const categories = new Container({ direction: 'vertical' });
        this.append(categories);

        // Categories
        this.db.categories.forEach(([categoryId, category]) => {
            this.renderCategory(categories, categoryId, category);
        });

        // Add new category
        const addCategoryBox = new Box();
        this.append(addCategoryBox);
        const addCategory = new Addbox({
            text: 'ADD NEW CATEGORY',
            placeholder: 'Category name',
            callback: async (value) => {
                await this.addCategory(categories, value);
            }
        });
        addCategoryBox.append(addCategory);

        this.element.querySelector('#topbar-summary').innerText = `Your resources on ${Object.keys(this.db.boards).length} boards in ${Object.keys(this.db.categories).length} categories`;

    }

    async addCategory(parent, name) {
        this.app.spinner.show();
        const newCategory = await this.app.actor.addCategory(name);
        this.renderCategory(parent, newCategory[0], newCategory[1]);
        this.app.spinner.hide();
    }

    renderCategory(parent, categoryId, category) {

        // Category box
        const box = new Box({ title: '⇢ ' + category.name });

        // Pocket for boards
        const boards = new Container({ direction: 'horizontal' });
        box.append(boards);

        // Boards
        this.db.boards.forEach(([boardId, board]) => {
            if (board.categoryKey === categoryId) this.renderBoard(boards, boardId, board);
        });

        // Add new board
        const addBoard = new Addbox({
            text: 'ADD NEW BOARD',
            placeholder: 'Board name',
            callback: async (value) => {
                await this.addBoard(boards, value, categoryId);
            }
        });
        box.append(addBoard);

        // Add to parent
        parent.append(box);

    }

    async addBoard(parent, name, categoryId) {
        this.app.spinner.show();
        const newBoard = await this.app.actor.addBoard(name, categoryId);
        this.renderBoard(parent, newBoard[0][0], newBoard[0][1]);
        this.app.spinner.hide();
    }

    renderBoard(parent, boardId, board) {
        const icon = new BoardIcon({
            id: boardId,
            name: board.name,
            date: '00.00'
        });
        parent.append(icon);
    }

}