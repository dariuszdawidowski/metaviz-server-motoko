import Text "mo:base/Text";
import Iter "mo:base/Iter";
import HashMap "mo:base/HashMap";
//import Principal "mo:base/Principal";
import Source "mo:uuid/async/SourceV4";
import UUID "mo:uuid/UUID";
//import Debug "mo:base/Debug";

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
        category: ?Category;
    };

    let db_boards = HashMap.HashMap<Text, Board>(0, Text.equal, Text.hash);

    public query func getBoards() : async [(Text, Board)] {
        return Iter.toArray<(Text, Board)>(db_boards.entries());
    };

    public query func getBoard(key: Text) : async ?Board {
        return db_boards.get(key);
    };

    public shared func addBoard(name: Text, category: Text) : async (Text, Board) {
        let cat = await getCategory(category);
        let g = Source.Source();
        let uuid = UUID.toText(await g.new());
        let newBoard : Board = {
            name = name;
            category = cat;
        };
        db_boards.put(uuid, newBoard);
        return (uuid, newBoard);
    };

    public shared func delBoard(key: Text) : async () {
        db_boards.delete(key);
    };

};
