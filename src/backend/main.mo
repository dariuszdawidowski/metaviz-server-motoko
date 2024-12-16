import Text "mo:base/Text";
import Iter "mo:base/Iter";
import Buffer "mo:base/Buffer";
import HashMap "mo:base/HashMap";
import Principal "mo:base/Principal";
import Source "mo:uuid/async/SourceV4";
import UUID "mo:uuid/UUID";
import Time "mo:base/Time";
import Map "mo:map/Map";
import { thash } "mo:map/Map";
import Debug "mo:base/Debug";


actor {

    //public query (message) func greet() : async Text {
    //    return "Hello, " # Principal.toText(message.caller) # "!";
    //};

    /*** Database for REGISTER USERS ***/

    type Register = {
        userKey: Text;
        timestamp: Time.Time;
    };

    // let db_register = HashMap.HashMap<Text, Register>(0, Text.equal, Text.hash);
    stable let db_register = Map.new<Text, Register>();

    public shared (_message) func addRegister(userKey: Text) : async Text {
        let g = Source.Source();
        let uuid = UUID.toText(await g.new());
        let newRegister : Register = {
            userKey = userKey;
            timestamp = Time.now();
        };
        Map.set(db_register, thash, uuid, newRegister);
        // db_register.put(uuid, newRegister);
        return uuid;
    };

    public query (_message) func getRegister(key: Text) : async ?Register {
        return Map.get(db_register, thash, key);
        // return db_register.get(key);
    };

    /*** Database for CATEGORIES ***/

    type Category = {
        name: Text;
        index: Nat;
    };

    stable let db_categories = Map.new<Text, Category>();

    public query (_message) func getCategories() : async [(Text, Category)] {
        return Iter.toArray<(Text, Category)>(Map.entries(db_categories));
    };

    public query (_message) func getCategory(key: Text) : async ?Category {
        return Map.get(db_categories, thash, key);
    };

    public shared (_message) func addCategory(name: Text) : async (Text, Category) {
        let g = Source.Source();
        let uuid = UUID.toText(await g.new());
        let newCategory : Category = {
            name = name;
            index = db_categories.size() + 1;
        };
        Map.set(db_categories, thash, uuid, newCategory);
        return (uuid, newCategory);
    };

    public shared (_message) func delCategory(key: Text) : async () {
        Map.delete(db_categories, thash, key);
    };

    /*** Database for BOARDS ***/

    type Board = {
        name: Text;
        categoryKey: Text;
    };

    // let db_boards = HashMap.HashMap<Text, Board>(0, Text.equal, Text.hash);
    stable let db_boards = Map.new<Text, Board>();

    public shared (msg) func getBoards() : async [(Text, Board)] {
        let user_boards = HashMap.HashMap<Text, Board>(0, Text.equal, Text.hash);
        let user = await getUserByPrincipal(Principal.toText(msg.caller));
        switch (user) {
            case (null) { };
            case (?usr) {
                // Admin
                if (usr.1.role == 1) return Iter.toArray<(Text, Board)>(Map.entries(db_boards));
                // User
                let user_groups = await getUserGroups(usr.0);
                for ((boardKey, boardValue) in Map.entries(db_boards)) {
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
        return Map.get(db_boards, thash, key);
        // return db_boards.get(key);
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
        // db_boards.put(uuid, newBoard);
        Map.set(db_boards, thash, uuid, newBoard);
        return ?(uuid, newBoard);
    };

    public shared (_message) func delBoard(key: Text) : async () {
        Map.delete(db_boards, thash, key);
        // db_boards.delete(key);
    };

    /*** Database for USERS ***/

    type User = {
        name: Text;
        principal: Text;
        role: Nat; // 0 = user 1 = admin
    };

    // let db_users = HashMap.HashMap<Text, User>(0, Text.equal, Text.hash);
    stable let db_users = Map.new<Text, User>();

    public query (_message) func getUsers() : async [(Text, User)] {
        return Iter.toArray<(Text, User)>(Map.entries(db_users));
    };

    public query (_message) func getUser(key: Text) : async ?User {
        return Map.get(db_users, thash, key);
        // return db_users.get(key);
    };

    public query (_message) func getUserByPrincipal(principal: Text) : async ?(Text, User) {
        for ((key, value) in Map.entries(db_users)) {
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
        Map.set(db_users, thash, uuid, newUser);
        // db_users.put(uuid, newUser);
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
                // ignore db_users.replace(register.userKey, updUser);
                Map.set(db_users, thash, register.userKey, updUser);
                return ?principal;
            };
        };
        return null;
    };

    public shared (_message) func delUser(key: Text) : async () {
        Map.delete(db_users, thash, key);
        // db_users.delete(key);
    };

    /*** Database for ORGANIZATIONS ***/

    type Organization = {
        name: Text;
    };

    // let db_organizations = HashMap.HashMap<Text, Organization>(0, Text.equal, Text.hash);
    stable let db_organizations = Map.new<Text, Organization>();

    public query (_message) func getOrganizations() : async [(Text, Organization)] {
        return Iter.toArray<(Text, Organization)>(Map.entries(db_organizations));
    };

    public query (_message) func getOrganization(key: Text) : async ?Organization {
        return Map.get(db_organizations, thash, key);
        // return db_organizations.get(key);
    };

    public shared (_message) func addOrganization(name: Text) : async (Text, Organization) {
        let g = Source.Source();
        let uuid = UUID.toText(await g.new());
        let newOrganization : Organization = {
            name = name;
        };
        Map.set(db_organizations, thash, uuid, newOrganization);
        // db_organizations.put(uuid, newOrganization);
        return (uuid, newOrganization);
    };

    public shared (_message) func delOrganization(key: Text) : async () {
        Map.delete(db_organizations, thash, key);
        // db_organizations.delete(key);
    };

    /*** Database for GROUPS ***/

    type Group = {
        name: Text;
        organization: Text;
    };

    // let db_groups = HashMap.HashMap<Text, Group>(0, Text.equal, Text.hash);
    stable let db_groups = Map.new<Text, Group>();

    public query (_message) func getGroups() : async [(Text, Group)] {
        return Iter.toArray<(Text, Group)>(Map.entries(db_groups));
    };

    public query (_message) func getGroup(key: Text) : async ?Group {
        return Map.get(db_groups, thash, key);
        // return db_groups.get(key);
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
        Map.set(db_groups, thash, uuid, newGroup);
        // db_groups.put(uuid, newGroup);
        return ?(uuid, newGroup);
    };

    public shared (_message) func delGroup(key: Text) : async () {
        Map.delete(db_groups, thash, key);
        // db_groups.delete(key);
    };

    /*** Database for USERS in GROUPS ***/

    type UserGroup = {
        user: Text;
        group: Text;
    };

    // let db_users_groups = HashMap.HashMap<Text, UserGroup>(0, Text.equal, Text.hash);
    stable let db_users_groups = Map.new<Text, UserGroup>();

    public query (_message) func getUsersInGroups() : async [(Text, UserGroup)] {
        return Iter.toArray<(Text, UserGroup)>(Map.entries(db_users_groups));
    };

    public query (_message) func getUserInGroup(userKey: Text, groupKey: Text) : async ?Text {
        for ((key, value) in Map.entries(db_users_groups)) {
            if (value.user == userKey and value.group == groupKey) return ?key;
        };
        return null;
    };

    public query func getUserGroups(userKey: Text) : async [Text] {
        let groups = Buffer.Buffer<Text>(0);
        for ((key, value) in Map.entries(db_users_groups)) {
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
            Map.set(db_users_groups, thash, uuid, newUserGroup);
            // db_users_groups.put(uuid, newUserGroup);            
        }
    };

    public shared (_message) func delUserFromGroup(userKey: Text, groupKey: Text) : async () {
        let key = await getUserInGroup(userKey, groupKey);
        switch (key) {
            case (null) { };
            case (?text) { 
                Map.delete(db_users_groups, thash, text);
                // db_users_groups.delete(text)
            };
        };
    };

    /*** Database for BOARDS in GROUPS ***/

    type BoardGroup = {
        board: Text;
        group: Text;
    };

    // let db_boards_groups = HashMap.HashMap<Text, BoardGroup>(0, Text.equal, Text.hash);
    stable let db_boards_groups = Map.new<Text, BoardGroup>();

    public query (_message) func getBoardsInGroups() : async [(Text, BoardGroup)] {
        return Iter.toArray<(Text, BoardGroup)>(Map.entries(db_boards_groups));
    };

    public query (_message) func getBoardInGroup(boardKey: Text, groupKey: Text) : async ?Text {
        for ((key, value) in Map.entries(db_boards_groups)) {
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
            Map.set(db_boards_groups, thash, uuid, newBoardGroup);
            // db_boards_groups.put(uuid, newBoardGroup);            
        };
    };

    public shared (_message) func delBoardFromGroup(boardKey: Text, groupKey: Text) : async () {
        let key = await getBoardInGroup(boardKey, groupKey);
        switch (key) {
            case (null) { };
            case (?text) {
                Map.delete(db_boards_groups, thash, text);
                // db_boards_groups.delete(text)
            };
        };
    };

};
