import React, { useEffect, useRef, useState } from "react";
import logo from "../../assets/logo.png";
import { Actor, HttpAgent } from "@dfinity/agent";
import { idlFactory } from "../../../declarations/nft";
import { idleFactory as tokenFactory } from "../../../declarations/dtoken_backend"
import { Principal } from "@dfinity/principal";
import Button from "./Button";
import { opnft_backend } from "../../../declarations/opnft_backend";
import CURRENT_USER_ID from "../index";
import PriceLabel from "./PriceLabel";

function Item(props) {

  const [name, setName] = useState("");
  const [owner, setOwner] = useState("");
  const [image, setImage] = useState("");
  const [button, setButton] = useState();
  const [priceInput, setPriceInput] = useState();
  const [loader, setLoader] = useState(true);
  const [blur, setBlur] = useState()
  const [sellStatus, setSellStatus] = useState();
  const [shouldDisplay, setDisplay] = useState(true);
  const price = useRef();



  const id = Principal.fromText(props.id);

  const http = "http://localhost:8080/";
  const agent = new HttpAgent({
    host: http
  });
  // WHEN DEPLOYING LIVE REMOVE IT
  agent.fetchRootKey();
  let NFTActor;

  async function loadNFT() {
    NFTActor = await Actor.createActor(idlFactory, {
      agent,
      canisterId: id
    });

    const NFTNAME = await NFTActor.getName();
    const NFTOWNER = await NFTActor.getOwner();
    const NFTCONTENT = await NFTActor.getContent();
    const imageData = new Uint8Array(NFTCONTENT);
    const url = URL.createObjectURL(new Blob([imageData.buffer], { type: "image/png" }));

    setName(NFTNAME);
    setOwner(NFTOWNER.toString());
    setImage(url);

    if (props.role == "collection") {
      const NFTisListed = await opnft_backend.isListed(id);
      if (NFTisListed) {
        setOwner("OpNFT")
        setBlur({ filter: "blur(4px)" })
        setButton(null);
        setSellStatus("Listed");
      } else {
        setButton(<Button onClick={Sell} text="Sell" />)
      }
    } else if (props.role == "discover") {
      const originalOwner = await opnft_backend.getOriginalOwner(id);
      if (originalOwner.toString() != CURRENT_USER_ID.toString()) {
        setButton(<Button onClick={handleBuy} text="Buy" />)
      }
      const itemPrice = await opnft_backendgetListedNFTPrice(id);
      setPriceInput(<PriceLabel price={itemPrice.toString()} />);
    }


  }

  useEffect(() => { loadNFT() }, [])

  function Sell() {
    setPriceInput(<input
      placeholder="Price in DANG"
      type="number"
      className="price-input"
      ref={price}
    />)

    setButton(<Button onClick={SetPrice} text="Confirm" />)
  }

  async function SetPrice() {
    setBlur({ filter: "blur(4px)" })
    setLoader(false);
    setButton(null);
    const res = await opnft_backend.ListItem(id, Number(price.current.value))
    console.log(res);
    if (res === "NFT found") {
      const opnftId = await opnft_backend.getCanisterId();
      const transferRes = await NFTActor.Transfer(opnftId);
      console.log(transferRes);
      if (transferRes == "Transfer Successful") {
        setLoader(true);
        setPriceInput(<PriceLabel price={price.current?.value} />)
        setOwner("OpNFT");
        setSellStatus("Listed");
      }
    }
    ;
  }

  async function handleBuy() {
    setLoader(false);
    console.log("Bought");
    const tokenActor = await Actor.createActor(tokenFactory,
      {
        agent,
        canisterId: process.env.DTOKEN_BACKEND_CANISTER_ID
      });
    const sellerId = await opnft_backend.getOriginalOwner(id);
    const itemPrice = await opnft_backend.getListedNFTPrice(id);
    const res = await tokenActor.transfer(sellerId, itemPrice);
    if (res = "Success") {
      const transRes = await opnft_backend.completePurchase(id, sellerId, CURRENT_USER_ID)
      console.log(transRes);
      setLoader(true);
      setDisplay(false);
    }


  }

  return (
    <div style={{ display: shouldDisplay ? "inline" : "none" }} className="disGrid-item">
      <div className="disPaper-root disCard-root makeStyles-root-17 disPaper-elevation1 disPaper-rounded">
        <img
          className="disCardMedia-root makeStyles-image-19 disCardMedia-media disCardMedia-img"
          src={image}
          style={blur}
        />
        <div className="lds-ellipsis" hidden={loader}>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
        </div>
        <div className="disCardContent-root">
          <h2 className="disTypography-root makeStyles-bodyText-24 disTypography-h5 disTypography-gutterBottom">
            {name}<span className="purple-text">{sellStatus}</span>
          </h2>
          <p className="disTypography-root makeStyles-bodyText-24 disTypography-body2 disTypography-colorTextSecondary">
            Owner: {owner}
          </p>
          {priceInput}
          {button}
        </div>
      </div>
    </div>
  );
}

export default Item;
