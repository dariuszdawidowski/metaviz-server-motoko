import Text "mo:base/Text";
import HashMap "mo:base/HashMap";
import Principal "mo:base/Principal";

actor {
    let store = HashMap.HashMap<Text, Text>(0, Text.equal, Text.hash);

    public query (message) func greet() : async Text {
        return "Hello, " # Principal.toText(message.caller) # "!";
    };

    public query func get(key: Text) : async ?Text {
        return store.get(key);
    };

    public shared func post(key: Text, data: Text) : async () {
        store.put(key, data);
    }

};
