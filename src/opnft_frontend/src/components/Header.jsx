import React, { useEffect, useState } from "react";
import logo from "../../assets/logo.png";
import { BrowserRouter, Link, Routes, Route, createBrowserRouter } from "react-router-dom";
import homeImage from "../../assets/home-img.png";
import Item from "./Item";
import Minter from "./Minter";
import Gallery from "./Gallery";
import { opnft_backend } from "../../../declarations/opnft_backend";
import CURRENT_USER_ID from "../index"


function Header() {

  const [userGallery, setUserGallery] = useState();
  const [listedGallery, steListedGallery] = useState();

  async function getNFTs() {
    const userNFTs = await opnft_backend.getOwnedNFTs(CURRENT_USER_ID)
    console.log(userNFTs);
    setUserGallery(<Gallery title="My Collection" ids={userNFTs} role="collection" />)

    const listedNFTIds = await opnft_backend.getListedNFTs();
    steListedGallery(<Gallery title="Discover" ids={listedNFTIds} role="discover" />);
  }
  useEffect(() => { getNFTs() }, [])

  return (
    <BrowserRouter forceRefresh={true}>
      <div className="app-root-1">
        <header className="Paper-root AppBar-root AppBar-positionStatic AppBar-colorPrimary Paper-elevation4">
          <div className="Toolbar-root Toolbar-regular header-appBar-13 Toolbar-gutters">
            <div className="header-left-4"></div>
            <img className="header-logo-11" src={logo} alt="logo" />
            <div className="header-vertical-9"></div>
            <Link to="/">
              <h5 className="Typography-root header-logo-text">OpNFT</h5>
            </Link>
            <div className="header-empty-6"></div>
            <div className="header-space-8"></div>
            <button className="ButtonBase-root Button-root Button-text header-navButtons-3">
              <Link to="/discover">
                Discover
              </Link>
            </button>
            <button className="ButtonBase-root Button-root Button-text header-navButtons-3">
              <Link to="/minter">
                Minter
              </Link>
            </button>
            <button className="ButtonBase-root Button-root Button-text header-navButtons-3">
              <Link to="/collections" >
                My NFTs
              </Link>
            </button>
          </div>
        </header>
      </div>
      <Routes relo>  //notice the s
        <Route exact path="/"
          element={<img className="bottom-space" src={homeImage} />}>
        </Route>
        <Route path="/discover"
          element={<h1>Discover</h1>}>
        </Route>
        <Route path="/minter"
          element={<Minter />}>
        </Route>
        <Route path="/collections"
          element={userGallery}
        />
      </Routes >
    </BrowserRouter >
  );
}

export default Header;
