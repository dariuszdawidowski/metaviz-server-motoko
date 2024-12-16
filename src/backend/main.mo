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
// import Debug "mo:base/Debug";


actor {

    /*** Database for REGISTER USERS ***/

    type Register = {
        userKey: Text;
        timestamp: Time.Time;
    };

    stable let db_register = Map.new<Text, Register>();

    public shared (msg) func addRegister(userKey: Text) : async Text {
        // Admin
        if (Principal.isController(msg.caller)) {
            let g = Source.Source();
            let uuid = UUID.toText(await g.new());
            let newRegister : Register = {
                userKey = userKey;
                timestamp = Time.now();
            };
            Map.set(db_register, thash, uuid, newRegister);
            return uuid;
        };
        return "";
    };

    public query (_message) func getRegister(key: Text) : async ?Register {
        return Map.get(db_register, thash, key);
    };

    /*** Database for CATEGORIES ***/

    type Category = {
        name: Text;
        index: Nat;
    };

    stable let db_categories = Map.new<Text, Category>();

    public query (msg) func getCategories() : async [(Text, Category)] {
        // Anonymous
        if (Principal.isAnonymous(msg.caller)) return [];
        // User
        return Iter.toArray<(Text, Category)>(Map.entries(db_categories));
    };

    public query (msg) func getCategory(key: Text) : async ?Category {
        // Anonymous
        if (Principal.isAnonymous(msg.caller)) return null;
        // User
        return Map.get(db_categories, thash, key);
    };

    public shared (msg) func addCategory(name: Text) : async (Text, Category) {
        // Anonymous
        if (Principal.isAnonymous(msg.caller)) return ("", { name = ""; index = 0 });
        // User
        let g = Source.Source();
        let uuid = UUID.toText(await g.new());
        let newCategory : Category = {
            name = name;
            index = db_categories.size() + 1;
        };
        Map.set(db_categories, thash, uuid, newCategory);
        return (uuid, newCategory);
    };

    public shared (msg) func delCategory(key: Text) : async () {
        // Anonymous
        if (Principal.isAnonymous(msg.caller)) return;
        // User
        Map.delete(db_categories, thash, key);
    };

    /*** Database for BOARDS ***/

    type Board = {
        name: Text;
        categoryKey: Text;
    };

    stable let db_boards = Map.new<Text, Board>();

    public shared (msg) func getBoards() : async [(Text, Board)] {
        // Anonymous
        if (Principal.isAnonymous(msg.caller)) return [];
        // Admin
        if (Principal.isController(msg.caller)) return Iter.toArray<(Text, Board)>(Map.entries(db_boards));
        // User
        let user_boards = HashMap.HashMap<Text, Board>(0, Text.equal, Text.hash);
        let user = await getUserByPrincipal(Principal.toText(msg.caller));
        switch (user) {
            case (null) { };
            case (?usr) {
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

    public query (msg) func getBoard(key: Text) : async ?Board {
        // Anonymous
        if (Principal.isAnonymous(msg.caller)) return null;
        // User
        return Map.get(db_boards, thash, key);
    };

    public shared (msg) func addBoard(name: Text, categoryKey: Text) : async ?(Text, Board) {
        // Admin
        if (Principal.isController(msg.caller)) {
            let cat = await getCategory(categoryKey);
            if (cat == null) return null;
            let g = Source.Source();
            let uuid = UUID.toText(await g.new());
            let newBoard : Board = {
                name = name;
                categoryKey = categoryKey;
            };
            Map.set(db_boards, thash, uuid, newBoard);
            return ?(uuid, newBoard);
        };
        return null;
    };

    public shared (msg) func delBoard(key: Text) : async () {
        // Admin
        if (Principal.isController(msg.caller)) {
            Map.delete(db_boards, thash, key);
        }
    };

    /*** Database for USERS ***/

    type User = {
        name: Text;
        principal: Text;
    };

    stable let db_users = Map.new<Text, User>();

    public query (msg) func getUsers() : async [(Text, User)] {
        // Admin
        if (Principal.isController(msg.caller)) {
            return Iter.toArray<(Text, User)>(Map.entries(db_users));
        };
        return [];
    };

    public query (msg) func getUser(key: Text) : async ?User {
        // Anonymous
        if (Principal.isAnonymous(msg.caller)) return null;
        // User
        return Map.get(db_users, thash, key);
    };

    public query (msg) func getUserByPrincipal(principal: Text) : async ?(Text, User) {
        // Anonymous
        if (Principal.isAnonymous(msg.caller)) return null;
        // User
        for ((key, value) in Map.entries(db_users)) {
            if (value.principal == principal) return ?(key, value);
        };
        return null;
    };

    public shared (msg) func addUser(name: Text) : async (Text, User) {
        // Admin
        if (Principal.isController(msg.caller)) {
            // User
            let g = Source.Source();
            let uuid = UUID.toText(await g.new());
            let newUser : User = {
                name = name;
                principal = if (db_users.size() == 0) { Principal.toText(msg.caller) } else { "" };
            };
            Map.set(db_users, thash, uuid, newUser);
            return (uuid, newUser);
        };
        return ("", { name = ""; principal = "" });
    };

    public shared (msg) func assignUser(userKey: Text, token: Text) : async ?Text {
        // Admin
        if (Principal.isController(msg.caller)) {
            let ?register = await getRegister(token);
            if (register.userKey == userKey) {
                let ?user = await getUser(register.userKey);
                let twentyFourHours : Time.Time = 24 * 60 * 60 * 1_000_000_000;
                if (Time.now() - register.timestamp < twentyFourHours) {
                    let principal = Principal.toText(msg.caller);
                    let updUser : User = {
                        name = user.name;
                        principal = principal;
                    };
                    Map.set(db_users, thash, register.userKey, updUser);
                    return ?principal;
                };
            };
        };
        return null;
    };

    public shared (msg) func delUser(key: Text) : async () {
        // Admin
        if (Principal.isController(msg.caller)) {
            Map.delete(db_users, thash, key);
        }
    };

    /*** Database for ORGANIZATIONS ***/

    type Organization = {
        name: Text;
    };

    stable let db_organizations = Map.new<Text, Organization>();

    public query (msg) func getOrganizations() : async [(Text, Organization)] {
        // Admin
        if (Principal.isController(msg.caller)) {
            return Iter.toArray<(Text, Organization)>(Map.entries(db_organizations));
        };
        return [];
    };

    public query (msg) func getOrganization(key: Text) : async ?Organization {
        // Anonymous
        if (Principal.isAnonymous(msg.caller)) return null;
        // User
        return Map.get(db_organizations, thash, key);
    };

    public shared (msg) func addOrganization(name: Text) : async (Text, Organization) {
        // Admin
        if (Principal.isController(msg.caller)) {
            let g = Source.Source();
            let uuid = UUID.toText(await g.new());
            let newOrganization : Organization = {
                name = name;
            };
            Map.set(db_organizations, thash, uuid, newOrganization);
            return (uuid, newOrganization);
        };
        return ("", { name = "" });
    };

    public shared (msg) func delOrganization(key: Text) : async () {
        // Admin
        if (Principal.isController(msg.caller)) {
            Map.delete(db_organizations, thash, key);
        };
    };

    /*** Database for GROUPS ***/

    type Group = {
        name: Text;
        organization: Text;
    };

    stable let db_groups = Map.new<Text, Group>();

    public query (msg) func getGroups() : async [(Text, Group)] {
        // Admin
        if (Principal.isController(msg.caller)) {
            return Iter.toArray<(Text, Group)>(Map.entries(db_groups));
        };
        return [];
    };

    public query (msg) func getGroup(key: Text) : async ?Group {
        // Anonymous
        if (Principal.isAnonymous(msg.caller)) return null;
        // User
        return Map.get(db_groups, thash, key);
    };

    public shared (msg) func addGroup(name: Text, organizationKey: Text) : async ?(Text, Group) {
        // Admin
        if (Principal.isController(msg.caller)) {
            let org = await getOrganization(organizationKey);
            if (org == null) return null;
            let g = Source.Source();
            let uuid = UUID.toText(await g.new());
            let newGroup : Group = {
                name = name;
                organization = organizationKey;
            };
            Map.set(db_groups, thash, uuid, newGroup);
            return ?(uuid, newGroup);
        };
        return null;
    };

    public shared (msg) func delGroup(key: Text) : async () {
        // Admin
        if (Principal.isController(msg.caller)) {
            Map.delete(db_groups, thash, key);
        };
    };

    /*** Database for USERS in GROUPS ***/

    type UserGroup = {
        user: Text;
        group: Text;
    };

    stable let db_users_groups = Map.new<Text, UserGroup>();

    public query (msg) func getUsersInGroups() : async [(Text, UserGroup)] {
        // Admin
        if (Principal.isController(msg.caller)) {
            return Iter.toArray<(Text, UserGroup)>(Map.entries(db_users_groups));
        };
        return [];
    };

    public query (msg) func getUserInGroup(userKey: Text, groupKey: Text) : async ?Text {
        // Anonymous
        if (Principal.isAnonymous(msg.caller)) return null;
        // User
        for ((key, value) in Map.entries(db_users_groups)) {
            if (value.user == userKey and value.group == groupKey) return ?key;
        };
        return null;
    };

    public query (msg) func getUserGroups(userKey: Text) : async [Text] {
        // Anonymous
        if (Principal.isAnonymous(msg.caller)) return [];
        // User
        let groups = Buffer.Buffer<Text>(0);
        for ((key, value) in Map.entries(db_users_groups)) {
            if (value.user == userKey) {
                groups.add(value.group);
            }
        };
        return Buffer.toArray(groups);
    };

    public shared (msg) func addUserToGroup(userKey: Text, groupKey: Text) : async () {
        // Admin
        if (Principal.isController(msg.caller)) {
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
            };
        };
    };

    public shared (msg) func delUserFromGroup(userKey: Text, groupKey: Text) : async () {
        // Admin
        if (Principal.isController(msg.caller)) {
            let key = await getUserInGroup(userKey, groupKey);
            switch (key) {
                case (null) { };
                case (?text) { 
                    Map.delete(db_users_groups, thash, text);
                };
            };
        };
    };

    /*** Database for BOARDS in GROUPS ***/

    type BoardGroup = {
        board: Text;
        group: Text;
    };

    stable let db_boards_groups = Map.new<Text, BoardGroup>();

    public query (msg) func getBoardsInGroups() : async [(Text, BoardGroup)] {
        // Admin
        if (Principal.isController(msg.caller)) {
            return Iter.toArray<(Text, BoardGroup)>(Map.entries(db_boards_groups));
        };
        return [];
    };

    public query (msg) func getBoardInGroup(boardKey: Text, groupKey: Text) : async ?Text {
        // Anonymous
        if (Principal.isAnonymous(msg.caller)) return null;
        // User
        for ((key, value) in Map.entries(db_boards_groups)) {
            if (value.board == boardKey and value.group == groupKey) {
                return ?key;
            }
        };
        return null;
    };

    public shared (msg) func addBoardToGroup(boardKey: Text, groupKey: Text) : async () {
        // Admin
        if (Principal.isController(msg.caller)) {
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
            };
        };
    };

    public shared (msg) func delBoardFromGroup(boardKey: Text, groupKey: Text) : async () {
        // Admin
        if (Principal.isController(msg.caller)) {
            let key = await getBoardInGroup(boardKey, groupKey);
            switch (key) {
                case (null) { };
                case (?text) {
                    Map.delete(db_boards_groups, thash, text);
                };
            };
        };
    };

};
