import Text "mo:base/Text";
import Iter "mo:base/Iter";
import HashMap "mo:base/HashMap";
import Principal "mo:base/Principal";
import Source "mo:uuid/async/SourceV4";
import UUID "mo:uuid/UUID";
import Debug "mo:base/Debug";

actor {

    //public query (message) func greet() : async Text {
    //    return "Hello, " # Principal.toText(message.caller) # "!";
    //};

    /*** Database for CATEGORIES ***/

    type Category = {
        name: Text;
        index: Nat;
    };

    let db_categories = HashMap.HashMap<Text, Category>(0, Text.equal, Text.hash);

    public query func getCategories() : async [(Text, Category)] {
        return Iter.toArray<(Text, Category)>(db_categories.entries());
    };

    public query func getCategory(key: Text) : async ?Category {
        return db_categories.get(key);
    };

    public shared func addCategory(name: Text) : async (Text, Category) {
        let g = Source.Source();
        let uuid = UUID.toText(await g.new());
        let newCategory : Category = {
            name = name;
            index = db_categories.size() + 1;
        };
        db_categories.put(uuid, newCategory);
        return (uuid, newCategory);
    };

    public shared func delCategory(key: Text) : async () {
        db_categories.delete(key);
    };

    /*** Database for BOARDS ***/

    type Board = {
        name: Text;
        categoryKey: Text;
    };

    let db_boards = HashMap.HashMap<Text, Board>(0, Text.equal, Text.hash);

    public query func getBoards() : async [(Text, Board)] {
        return Iter.toArray<(Text, Board)>(db_boards.entries());
    };

    public query func getBoard(key: Text) : async ?Board {
        return db_boards.get(key);
    };

    public shared func addBoard(name: Text, categoryKey: Text) : async ?(Text, Board) {
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

    public shared func delBoard(key: Text) : async () {
        db_boards.delete(key);
    };

    /*** Database for USERS ***/

    type User = {
        name: Text;
    };

    let db_users = HashMap.HashMap<Text, User>(0, Text.equal, Text.hash);

    public query func getUsers() : async [(Text, User)] {
        return Iter.toArray<(Text, User)>(db_users.entries());
    };

    public query func getUser(key: Text) : async ?User {
        return db_users.get(key);
    };

    public shared func addUser(name: Text) : async (Text, User) {
        let g = Source.Source();
        let uuid = UUID.toText(await g.new());
        let newUser : User = {
            name = name;
        };
        db_users.put(uuid, newUser);
        return (uuid, newUser);
    };

    public shared func delUser(key: Text) : async () {
        db_users.delete(key);
    };

    /*** Database for ORGANIZATIONS ***/

    type Organization = {
        name: Text;
    };

    let db_organizations = HashMap.HashMap<Text, Organization>(0, Text.equal, Text.hash);

    public query func getOrganizations() : async [(Text, Organization)] {
        return Iter.toArray<(Text, Organization)>(db_organizations.entries());
    };

    public query func getOrganization(key: Text) : async ?Organization {
        return db_organizations.get(key);
    };

    public shared func addOrganization(name: Text) : async (Text, Organization) {
        let g = Source.Source();
        let uuid = UUID.toText(await g.new());
        let newOrganization : Organization = {
            name = name;
        };
        db_organizations.put(uuid, newOrganization);
        return (uuid, newOrganization);
    };

    public shared func delOrganization(key: Text) : async () {
        db_organizations.delete(key);
    };

    /*** Database for GROUPS ***/

    type Group = {
        name: Text;
        organization: Text;
    };

    let db_groups = HashMap.HashMap<Text, Group>(0, Text.equal, Text.hash);

    public query func getGroups() : async [(Text, Group)] {
        return Iter.toArray<(Text, Group)>(db_groups.entries());
    };

    public query func getGroup(key: Text) : async ?Group {
        return db_groups.get(key);
    };

    public shared func addGroup(name: Text, organizationKey: Text) : async ?(Text, Group) {
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

    public shared func delGroup(key: Text) : async () {
        db_groups.delete(key);
    };

    /*** Database for USERS in GROUPS ***/

    type UserGroup = {
        user: Text;
        group: Text;
    };

    let db_users_groups = HashMap.HashMap<Text, UserGroup>(0, Text.equal, Text.hash);

    public query func getUsersInGroups() : async [(Text, UserGroup)] {
        return Iter.toArray<(Text, UserGroup)>(db_users_groups.entries());
    };

    public query func getUserInGroup(userKey: Text, groupKey: Text) : async ?Text {
        for ((key, value) in db_users_groups.entries()) {
            if (value.user == userKey and value.group == groupKey) {
                return ?key;
            }
        };
        return null;
    };

    public shared func addUserToGroup(userKey: Text, groupKey: Text) : async () {
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

    public shared func delUserFromGroup(userKey: Text, groupKey: Text) : async () {
        let key = await getUserInGroup(userKey, groupKey);
        switch (key) {
            case (null) { };
            case (?text) { db_users_groups.delete(text) };
        }
    };

    /*** Database for BOARDS in GROUPS ***/

    type BoardGroup = {
        board: Text;
        group: Text;
    };

    let db_boards_groups = HashMap.HashMap<Text, BoardGroup>(0, Text.equal, Text.hash);

    public query func getBoardsInGroups() : async [(Text, BoardGroup)] {
        return Iter.toArray<(Text, BoardGroup)>(db_boards_groups.entries());
    };

    public query func getBoardInGroup(boardKey: Text, groupKey: Text) : async ?Text {
        for ((key, value) in db_boards_groups.entries()) {
            if (value.board == boardKey and value.group == groupKey) {
                return ?key;
            }
        };
        return null;
    };

    public shared func addBoardToGroup(boardKey: Text, groupKey: Text) : async () {
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
        }
    };

    public shared func delBoardFromGroup(boardKey: Text, groupKey: Text) : async () {
        let key = await getBoardInGroup(boardKey, groupKey);
        switch (key) {
            case (null) { };
            case (?text) { db_boards_groups.delete(text) };
        }
    };

};
