import { backend } from 'declarations/backend';
import { Component } from 'frontend/src/utils/Component.js';
import { Addbox } from 'frontend/src/widgets/Addbox.js';
import { Box } from 'frontend/src/widgets/Box.js';
import { Container } from 'frontend/src/widgets/Container.js';
import { Topbar } from 'frontend/src/widgets/Topbar.js';
import { UserIcon } from 'frontend/src/widgets/UserIcon.js';
import { BoardIcon } from 'frontend/src/widgets/BoardIcon.js';
import { OrganizationIcon } from 'frontend/src/widgets/OrganizationIcon.js';


export class PageGroups extends Component {

    constructor(args) {
        super(args);
        this.fetch().then(() => this.build());
    }

    async fetch() {
        this.db = {
            organizations: await backend.getOrganizations(),
            groups: await backend.getGroups(),
            users: await backend.getUsers(),
            boards: await backend.getBoards(),
            usersInGroups: await backend.getUsersInGroups(),
            boardsInGroups: await backend.getBoardsInGroups(),
        };
    }

    async build() {

        // Topbar component
        this.topbar = new Topbar({text: `Administration of x groups in x organizations`});
        this.append(this.topbar);

        // Pocket for organizations
        const organizations = new Container({ direction: 'vertical' });
        this.append(organizations);

        // Organizations
        this.db.organizations.forEach(([organizationId, organization]) => {
            this.renderOrganization(organizations, organizationId, organization);
        });

        // Add new organization
        const addOrganizationBox = new Box();
        this.append(addOrganizationBox);
        const addOrganization = new Addbox({
            text: 'ADD NEW ORGANIZATION',
            placeholder: 'Organization name',
            callback: async (value) => {
                await this.addOrganization(organizations, value);
            }
        });
        addOrganizationBox.append(addOrganization);

        // Update topbar
        this.element.querySelector('#topbar-summary').innerText = `Administration of ${0} groups in ${this.db.organizations.length} organization${this.db.organizations.length > 1 ? 's' : ''}`;
    }

    async addOrganization(parent, name) {
        this.app.spinner.show();
        const newOrganization = await backend.addOrganization(name);
        this.renderOrganization(parent, newOrganization[0], newOrganization[1]);
        this.app.spinner.hide();
    }

    renderOrganization(parent, organizationId, organization) {
        // Organization header
        const icon = new OrganizationIcon({
            id: organizationId,
            name: organization.name,
        });
        parent.append(icon);

        // Pocket for groups
        const groups = new Container({ direction: 'vertical' });
        parent.append(groups);

        this.db.groups.forEach(([groupId, group]) => {
            if (group.organization == organizationId) this.renderGroup(groups, groupId, group);
        });

        // Add new group
        const addGroupBox = new Box();
        parent.append(addGroupBox);
        const addGroup = new Addbox({
            text: 'ADD NEW GROUP',
            placeholder: 'Group name',
            callback: async (value) => {
                await this.addGroup(groups, value, organizationId);
            }
        });
        addGroupBox.append(addGroup);
    }

    async addGroup(parent, name, organizationId) {
        this.app.spinner.show();
        const newGroup = await backend.addGroup(name, organizationId);
        this.renderGroup(parent, newGroup[0][0], newGroup[0][1]);
        this.app.spinner.hide();
    }

    renderGroup(parent, groupId, group) {

        // New group box
        const groupBox = new Box({ title: '⇢ ' + group.name });

        // Users pocket
        const users = new Container({ direction: 'horizontal' });
        groupBox.append(users);

        // Assigned users list
        this.db.usersInGroups.forEach(([id, userInGroup]) => {
            if (userInGroup.group == groupId) {
                const user = this.getUser(userInGroup.user);
                if (user) this.renderUser(users, userInGroup.user, user);
            }
        });

        // + Assign user
        const assignUser = new Addbox({
            text: 'ASSIGN USER',
            placeholder: 'Search for user name',
            list: this.db.users.reduce((acc, [key, value]) => { acc[key] = value.name; return acc; }, {}),
            callback: async (value) => {
                this.app.spinner.show();
                await backend.addUserToGroup(value, groupId);
                const user = this.getUser(value);
                if (user) this.renderUser(users, value, user);
                this.app.spinner.hide();
            }
        });
        groupBox.append(assignUser);

        // Boards pocket
        const boards = new Container({ direction: 'horizontal' });
        groupBox.append(boards);

        // Assigned boards list
        this.db.boardsInGroups.forEach(([id, boardInGroup]) => {
            if (boardInGroup.group == groupId) {
                const board = this.getBoard(boardInGroup.board);
                if (board) this.renderBoard(boards, boardInGroup.board, board);
            }
        });

        // + Assign board
        const assignBoard = new Addbox({
            text: 'ASSIGN BOARD',
            placeholder: 'Search for board name',
            list: this.db.boards.reduce((acc, [key, value]) => { acc[key] = value.name; return acc; }, {}),
            callback: async (value) => {
                this.app.spinner.show();
                await backend.addBoardToGroup(value, groupId);
                const board = this.getBoard(value);
                if (board) this.renderBoard(boards, value, board);
                this.app.spinner.hide();
            }
        });
        groupBox.append(assignBoard);

        // Attach to parent
        parent.append(groupBox);

    }

    getUser(userId) {
        for (const entry of this.db.users) {
            if (entry[0] == userId) return entry[1];
        }
        return null;
    }

    renderUser(parent, userId, user) {
        const icon = new UserIcon({
            id: userId,
            name: user.name,
        });
        parent.append(icon);
    }

    getBoard(boardId) {
        for (const entry of this.db.boards) {
            if (entry[0] == boardId) return entry[1];
        }
        return null;
    }

    renderBoard(parent, boardId, board) {
        const icon = new BoardIcon({
            type: 'assigned',
            id: boardId,
            name: board.name,
        });
        parent.append(icon);
    }

}