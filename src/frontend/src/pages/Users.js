import { backend } from 'declarations/backend';
import { Component } from 'frontend/src/utils/Component.js';
import { Addbox } from 'frontend/src/widgets/Addbox.js';
import { Box } from 'frontend/src/widgets/Box.js';
import { Container } from 'frontend/src/widgets/Container.js';
import { Topbar } from 'frontend/src/widgets/Topbar.js';


export class PageUsers extends Component {

    constructor(args) {
        super(args);
        this.fetch().then(() => this.build());
    }

    async fetch() {
        this.db = {
            users: await backend.getUsers(),
        };
    }

    async build() {

        // Topbar component
        this.topbar = new Topbar({text: `Administration of x users`});
        this.append(this.topbar);

        // Pocket for users
        const users = new Container({ direction: 'horizontal' });
        this.append(users);

            // Users
        this.db.users.forEach(([principal, user]) => {
        });

        // Add new user
        const addUserBox = new Box();
        this.append(addUserBox);
        const addUser = new Addbox({
            text: 'ADD NEW USER',
            placeholder: 'User name',
            callback: async (value) => {
                await this.addNewUser(users, value);
            }
        });
        addUserBox.append(addUser);

        this.element.querySelector('#topbar-summary').innerText = `Administration of ${0} users`;

    }

    async addNewUser(parent, name) {
        this.app.spinner.show();
        const newUser = await backend.addUser('principal', name);
        // const icon = new BoardUser({
        //     principal: newUser[0],
        //     name: newUser[1].name,
        // });
        parent.append(icon);
        this.app.spinner.hide();
    }

}