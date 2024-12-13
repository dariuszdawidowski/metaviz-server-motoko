import Text "mo:base/Text";
import Iter "mo:base/Iter";
import Buffer "mo:base/Buffer";
import HashMap "mo:base/HashMap";
import Principal "mo:base/Principal";
import Source "mo:uuid/async/SourceV4";
import UUID "mo:uuid/UUID";
import Time "mo:base/Time";
//import Debug "mo:base/Debug";


actor {

    //public query (message) func greet() : async Text {
    //    return "Hello, " # Principal.toText(message.caller) # "!";
    //};

    /*** Database for REGISTER USERS ***/

    type Register = {
        userKey: Text;
        timestamp: Time.Time;
    };

    let db_register = HashMap.HashMap<Text, Register>(0, Text.equal, Text.hash);

    public shared (_message) func addRegister(userKey: Text) : async Text {
        let g = Source.Source();
        let uuid = UUID.toText(await g.new());
        let newRegister : Register = {
            userKey = userKey;
            timestamp = Time.now();
        };
        db_register.put(uuid, newRegister);
        return uuid;
    };

    public query (_message) func getRegister(key: Text) : async ?Register {
        return db_register.get(key);
    };

    /*** Database for CATEGORIES ***/

    type Category = {
        name: Text;
        index: Nat;
    };

    let db_categories = HashMap.HashMap<Text, Category>(0, Text.equal, Text.hash);

    public query (_message) func getCategories() : async [(Text, Category)] {
        return Iter.toArray<(Text, Category)>(db_categories.entries());
    };

    public query (_message) func getCategory(key: Text) : async ?Category {
        return db_categories.get(key);
    };

    public shared (_message) func addCategory(name: Text) : async (Text, Category) {
        let g = Source.Source();
        let uuid = UUID.toText(await g.new());
        let newCategory : Category = {
            name = name;
            index = db_categories.size() + 1;
        };
        db_categories.put(uuid, newCategory);
        return (uuid, newCategory);
    };

    public shared (_message) func delCategory(key: Text) : async () {
        db_categories.delete(key);
    };

    /*** Database for BOARDS ***/

    type Board = {
        name: Text;
        categoryKey: Text;
    };

    let db_boards = HashMap.HashMap<Text, Board>(0, Text.equal, Text.hash);

    public shared (message) func getBoards() : async [(Text, Board)] {
        let user_boards = HashMap.HashMap<Text, Board>(0, Text.equal, Text.hash);
        let user = await getUserByPrincipal(Principal.toText(message.caller));
        switch (user) {
            case (null) { };
            case (?usr) {
                // Admin
                if (usr.1.role == 1) return Iter.toArray<(Text, Board)>(db_boards.entries());
                // User
                let user_groups = await getUserGroups(usr.0);
                for ((boardKey, boardValue) in db_boards.entries()) {
                    for (groupKey in user_groups.vals()) {
                        let is_in_group = await getBoardInGroup(boardKey, groupKey);
                        if (is_in_group != null) user_boards.put(boardKey, boardValue);
                    };
                };
            };
        };
        return Iter.toArray<(Text, Board)>(user_boards.entries());
    };

    public query (_message) func getBoard(key: Text) : async ?Board {
        return db_boards.get(key);
    };

    public shared (_message) func addBoard(name: Text, categoryKey: Text) : async ?(Text, Board) {
        let cat = await getCategory(categoryKey);
        if (cat == null) return null;
        let g = Source.Source();
        let uuid = UUID.toText(await g.new());
        let newBoard : Board = {
            name = name;
            categoryKey = categoryKey;
        };
        db_boards.put(uuid, newBoard);
        return ?(uuid, newBoard);
    };

    public shared (_message) func delBoard(key: Text) : async () {
        db_boards.delete(key);
    };

    /*** Database for USERS ***/

    type User = {
        name: Text;
        principal: Text;
        role: Nat; // 0 = user 1 = admin
    };

    let db_users = HashMap.HashMap<Text, User>(0, Text.equal, Text.hash);

    public query (_message) func getUsers() : async [(Text, User)] {
        return Iter.toArray<(Text, User)>(db_users.entries());
    };

    public query (_message) func getUser(key: Text) : async ?User {
        return db_users.get(key);
    };

    public query (_message) func getUserByPrincipal(principal: Text) : async ?(Text, User) {
        for ((key, value) in db_users.entries()) {
            if (value.principal == principal) return ?(key, value);
        };
        return null;
    };

    public shared (message) func addUser(name: Text) : async (Text, User) {
        let g = Source.Source();
        let uuid = UUID.toText(await g.new());
        let newUser : User = {
            name = name;
            principal = if (db_users.size() == 0) { Principal.toText(message.caller) } else { "" };
            role = if (db_users.size() == 0) { 1 } else { 0 };
        };
        db_users.put(uuid, newUser);
        return (uuid, newUser);
    };

    public shared (message) func assignUser(userKey: Text, token: Text) : async ?Text {
        let ?register = await getRegister(token);
        if (register.userKey == userKey) {
            let ?user = await getUser(register.userKey);
            let twentyFourHours : Time.Time = 24 * 60 * 60 * 1_000_000_000;
            if (Time.now() - register.timestamp < twentyFourHours) {
                let principal = Principal.toText(message.caller);
                let updUser : User = {
                    name = user.name;
                    principal = principal;
                    role = user.role;
                };
                ignore db_users.replace(register.userKey, updUser);
                return ?principal;
            };
        };
        return null;
    };

    public shared (_message) func delUser(key: Text) : async () {
        db_users.delete(key);
    };

    /*** Database for ORGANIZATIONS ***/

    type Organization = {
        name: Text;
    };

    let db_organizations = HashMap.HashMap<Text, Organization>(0, Text.equal, Text.hash);

    public query (_message) func getOrganizations() : async [(Text, Organization)] {
        return Iter.toArray<(Text, Organization)>(db_organizations.entries());
    };

    public query (_message) func getOrganization(key: Text) : async ?Organization {
        return db_organizations.get(key);
    };

    public shared (_message) func addOrganization(name: Text) : async (Text, Organization) {
        let g = Source.Source();
        let uuid = UUID.toText(await g.new());
        let newOrganization : Organization = {
            name = name;
        };
        db_organizations.put(uuid, newOrganization);
        return (uuid, newOrganization);
    };

    public shared (_message) func delOrganization(key: Text) : async () {
        db_organizations.delete(key);
    };

    /*** Database for GROUPS ***/

    type Group = {
        name: Text;
        organization: Text;
    };

    let db_groups = HashMap.HashMap<Text, Group>(0, Text.equal, Text.hash);

    public query (_message) func getGroups() : async [(Text, Group)] {
        return Iter.toArray<(Text, Group)>(db_groups.entries());
    };

    public query (_message) func getGroup(key: Text) : async ?Group {
        return db_groups.get(key);
    };

    public shared (_message) func addGroup(name: Text, organizationKey: Text) : async ?(Text, Group) {
        let org = await getOrganization(organizationKey);
        if (org == null) return null;
        let g = Source.Source();
        let uuid = UUID.toText(await g.new());
        let newGroup : Group = {
            name = name;
            organization = organizationKey;
        };
        db_groups.put(uuid, newGroup);
        return ?(uuid, newGroup);
    };

    public shared (_message) func delGroup(key: Text) : async () {
        db_groups.delete(key);
    };

    /*** Database for USERS in GROUPS ***/

    type UserGroup = {
        user: Text;
        group: Text;
    };

    let db_users_groups = HashMap.HashMap<Text, UserGroup>(0, Text.equal, Text.hash);

    public query (_message) func getUsersInGroups() : async [(Text, UserGroup)] {
        return Iter.toArray<(Text, UserGroup)>(db_users_groups.entries());
    };

    public query (_message) func getUserInGroup(userKey: Text, groupKey: Text) : async ?Text {
        for ((key, value) in db_users_groups.entries()) {
            if (value.user == userKey and value.group == groupKey) return ?key;
        };
        return null;
    };

    public query func getUserGroups(userKey: Text) : async [Text] {
        let groups = Buffer.Buffer<Text>(0);
        for ((key, value) in db_users_groups.entries()) {
            if (value.user == userKey) {
                groups.add(value.group);
            }
        };
        return Buffer.toArray(groups);
    };

    public shared (_message) func addUserToGroup(userKey: Text, groupKey: Text) : async () {
        let user = await getUser(userKey);
        let group = await getGroup(groupKey);
        if (user != null and group != null) {
            let g = Source.Source();
            let uuid = UUID.toText(await g.new());
            let newUserGroup : UserGroup = {
                user = userKey;
                group = groupKey;
            };
            db_users_groups.put(uuid, newUserGroup);            
        }
    };

    public shared (_message) func delUserFromGroup(userKey: Text, groupKey: Text) : async () {
        let key = await getUserInGroup(userKey, groupKey);
        switch (key) {
            case (null) { };
            case (?text) { db_users_groups.delete(text) };
        };
    };

    /*** Database for BOARDS in GROUPS ***/

    type BoardGroup = {
        board: Text;
        group: Text;
    };

    let db_boards_groups = HashMap.HashMap<Text, BoardGroup>(0, Text.equal, Text.hash);

    public query (_message) func getBoardsInGroups() : async [(Text, BoardGroup)] {
        return Iter.toArray<(Text, BoardGroup)>(db_boards_groups.entries());
    };

    public query (_message) func getBoardInGroup(boardKey: Text, groupKey: Text) : async ?Text {
        for ((key, value) in db_boards_groups.entries()) {
            if (value.board == boardKey and value.group == groupKey) {
                return ?key;
            }
        };
        return null;
    };

    public shared (_message) func addBoardToGroup(boardKey: Text, groupKey: Text) : async () {
        let board = await getBoard(boardKey);
        let group = await getGroup(groupKey);
        if (board != null and group != null) {
            let g = Source.Source();
            let uuid = UUID.toText(await g.new());
            let newBoardGroup : BoardGroup = {
                board = boardKey;
                group = groupKey;
            };
            db_boards_groups.put(uuid, newBoardGroup);            
        };
    };

    public shared (_message) func delBoardFromGroup(boardKey: Text, groupKey: Text) : async () {
        let key = await getBoardInGroup(boardKey, groupKey);
        switch (key) {
            case (null) { };
            case (?text) { db_boards_groups.delete(text) };
        };
    };

};
