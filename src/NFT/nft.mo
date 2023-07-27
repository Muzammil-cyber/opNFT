import Debug "mo:base/Debug";
import Nat8 "mo:base/Nat8";
import Principal "mo:base/Principal";
import Text "mo:base/Text";

actor class NFT(name : Text, owner : Principal, content : [Nat8]) = this {

    private let itemName = name;
    private var itemOwner = owner;
    private let imageByte = content;

    public query func getName() : async Text {
        return itemName;
    };
    public query func getOwner() : async Principal {
        return itemOwner;
    };
    public query func getContent() : async [Nat8] {
        return imageByte;
    };
    public query func getCanisterId() : async Principal {
        return Principal.fromActor(this);
    };

    public shared (e) func Transfer(newOwner : Principal) : async Text {
        if (e.caller == itemOwner) {
            itemOwner := newOwner;
            return "Transfer Successful";
        } else {
            return "Owner didn't Allowed";
        };
    };

};
