import Nat8 "mo:base/Nat8";
import Principal "mo:base/Principal";
import NFTActor "../NFT/nft";
import Cycles "mo:base/ExperimentalCycles";
import Debug "mo:base/Debug";
import HashMap "mo:base/HashMap";
import List "mo:base/List";
import Iter "mo:base/Iter";

actor OpNFT {

    private type Listing = {
        itemOwner : Principal;
        itemPrice : Nat;
    };

    var NFTs = HashMap.HashMap<Principal, NFTActor.NFT>(0, Principal.equal, Principal.hash);
    let NFTOwners = HashMap.HashMap<Principal, List.List<Principal>>(0, Principal.equal, Principal.hash);
    let mapOfListing = HashMap.HashMap<Principal, Listing>(0, Principal.equal, Principal.hash);

    public shared (e) func Mint(imgData : [Nat8], name : Text) : async Principal {
        let owner : Principal = e.caller;
        // 7_692_307_692
        Debug.print(debug_show (Cycles.balance()));
        Cycles.add(100_500_000_000);
        Debug.print(debug_show (Cycles.balance()));
        let newNFT = await NFTActor.NFT(name, owner, imgData);
        let newNFTPrincipal = await newNFT.getCanisterId();
        Debug.print(debug_show (Cycles.balance()));

        NFTs.put(newNFTPrincipal, newNFT);
        AddToOwnership(owner, newNFTPrincipal);

        return newNFTPrincipal;
    };

    private func AddToOwnership(owner : Principal, nftId : Principal) : () {
        var ownedNFT : List.List<Principal> = switch (NFTOwners.get(owner)) {
            case (?result) { result };
            case (null) { List.nil<Principal>() };
        };
        ownedNFT := List.push<Principal>(nftId, ownedNFT);
        NFTOwners.put(owner, ownedNFT);

    };

    public query func getOwnedNFTs(user : Principal) : async [Principal] {
        var userNFTs : List.List<Principal> = switch (NFTOwners.get(user)) {
            case (?value) { value };
            case (null) { List.nil<Principal>() };
        };
        return List.toArray(userNFTs);
    };

    public query func getListedNFTs() : async [Principal] {
        return Iter.toArray(mapOfListing.keys());
    };

    public shared (e) func ListItem(nftId : Principal, price : Nat) : async Text {
        let item = switch (NFTs.get(nftId)) {
            case (?value) { value };
            case (null) { return "NFT 404" };
        };

        let owner = await item.getOwner();
        if (Principal.equal(owner, e.caller)) {
            let newListing : Listing = {
                itemOwner = owner;
                itemPrice = price;
            };
            mapOfListing.put(nftId, newListing);
            return "NFT found";
        } else {
            return "Not Your NFT";
        };
    };

    public query func getCanisterId() : async Principal {
        return Principal.fromActor(OpNFT);
    };

    public query func isListed(id : Principal) : async Bool {
        if (mapOfListing.get(id) == null) {
            return false;
        } else {
            return true;
        };
    };
    public query func getOriginalOwner(id : Principal) : async Principal {
        var listing : Listing = switch (mapOfListing.get(id)) {
            case null return Principal.fromText("");
            case (?result) result;
        };

        return listing.itemOwner;
    };

    public query func getListedNFTPrice(id : Principal) : async Nat {
        var listing : Listing = switch (mapOfListing.get(id)) {
            case null return 0;
            case (?result) result;
        };

        return listing.itemPrice;

    };
    public shared (msg) func completePurchase(id : Principal, ownerId : Principal, newOwnerId : Principal) : async Text {
        var purchasedNFT : NFTActor.NFT = switch (NFTs.get(id)) {
            case null return "NFT does not exist";
            case (?result) result;
        };

        let transferResult = await purchasedNFT.Transfer(newOwnerId);
        if (transferResult == "Success") {
            mapOfListing.delete(id);
            var ownedNFTs : List.List<Principal> = switch (NFTOwners.get(ownerId)) {
                case null List.nil<Principal>();
                case (?result) result;
            };
            ownedNFTs := List.filter(
                ownedNFTs,
                func(listItemId : Principal) : Bool {
                    return listItemId != id;
                },
            );

            AddToOwnership(newOwnerId, id);
            return "Success";
        } else {
            Debug.print("hello");
            return transferResult;

        };
    };
};
