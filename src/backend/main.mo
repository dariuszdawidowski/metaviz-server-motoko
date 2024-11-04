import Text "mo:base/Text";
import Iter "mo:base/Iter";
import HashMap "mo:base/HashMap";
import Principal "mo:base/Principal";


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
        return Iter.toArray(db_categories.entries());
    };

    public query func getCategory(key: Text) : async ?Category {
        return db_categories.get(key);
    };

    public shared func addCategory(key: Text, data: Category) : async () {
        db_categories.put(key, data);
    };

    public shared func delCategory(key: Text) : async () {
        db_categories.delete(key);
    };

};
