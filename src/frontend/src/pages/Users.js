import { Component } from 'frontend/src/utils/Component.js';
import { Addbox } from 'frontend/src/widgets/Addbox.js';
import { Box } from 'frontend/src/widgets/Box.js';
import { Container } from 'frontend/src/widgets/Container.js';
import { Topbar } from 'frontend/src/widgets/Topbar.js';
import { UserIcon } from 'frontend/src/widgets/UserIcon.js';
import { getDataset } from 'frontend/src/utils/DOM.js';


export class PageUsers extends Component {

    constructor(args) {
        super(args);

        // Selected user
        this.selected = {
            id: null,
            name: null,
            valid: function() {
                console.log('valid', this.id, this.name)
                return (this.id != null && this.name != null);
            }
        };

        // Fetch data
        this.fetch().then(() => {
            this.build();
            this.menu();
        });
    }

    /**
     * Fetch data
     */

    async fetch() {
        this.db = {
            users: await this.app.actor.getUsers(),
        };
    }

    /**
     * Build components
     */

    build() {

        // Topbar component
        this.topbar = new Topbar({text: `Administration of x users`});
        this.append(this.topbar);

        // Category box
        const box = new Box({ title: '⇢ Users' });
        this.append(box);

        // Pocket for users
        const users = new Container({ direction: 'horizontal' });
        box.append(users);

        // Users
        this.db.users.forEach(([userId, user]) => {
            this.renderUser(users, userId, user);
        });

        // Add new user
        const addUser = new Addbox({
            text: 'ADD NEW USER',
            placeholder: 'User name',
            callback: async (value) => {
                await this.addUser(users, value);
            }
        });
        box.append(addUser);

        // Update topbar info
        this.element.querySelector('#topbar-summary').innerText = `Administration of ${0} users`;

    }

    /**
     * Build context menu for user
     */

    menu() {

        const menuUser = new TotalLiteMenu({container: document.body});
        menuUser.addItem({
            parent: 'root',
            id: 'edit-user',
            name: '✏️ Edit user',
            onClick: () => {
            }
        });
        menuUser.addItem({
            parent: 'root',
            id: 'register-user',
            name: '🔗 Generate register link',
            onClick: () => {
                const token = 123;
                alert(`Link to register user ${this.selected.name}: ${this.app.getFrontendURL()}/auth/register/?token=${token}`);
            }
        });
        menuUser.addItem({
            parent: 'root',
            id: 'del-user',
            name: '❌ Delete user',
            onClick: () => {
                if (confirm('Are you sure to delete this user?')) {
                }
            }
        });
        this.element.addEventListener('contextmenu', (event) => {
            event.preventDefault();
            this.selected.id = getDataset(event.target, 'userId');
            this.selected.name = getDataset(event.target, 'userName');
            if (this.selected.valid()) menuUser.show(event.clientX, event.clientY);
        });

    }

    /**
     * Add new user
     */

    async addUser(parent, name) {
        this.app.spinner.show();
        const newUser = await this.app.actor.addUser(name);
        this.renderUser(parent, newUser[0], newUser[1]);
        this.app.spinner.hide();
    }

    /**
     * Render user icon
     */

    renderUser(parent, userId, user) {
        const icon = new UserIcon({
            id: userId,
            name: user.name,
        });
        parent.append(icon);
    }

}