import React, { useEffect, useState } from "react";
import Item from "./Item";

function Gallery(props) {

  const [NFTIds, setNFTIds] = useState();

  function fetchNFTs() {
    console.log(props.ids);
    setNFTIds(props.ids.map((id) => <Item id={id.toString()} key={id.toString()} role={props.role} />))
  }
  useEffect(() => {
    fetchNFTs()
  }, [])

  const NFTID = props.ids
  return (
    <div className="gallery-view">
      <h3 className="makeStyles-title-99 Typography-h3">{props.title}</h3>
      <div className="disGrid-root disGrid-container disGrid-spacing-xs-2">
        <div className="disGrid-root disGrid-item disGrid-grid-xs-12">
          <div className="disGrid-root disGrid-container disGrid-spacing-xs-5 disGrid-justify-content-xs-center">
            {NFTIds}
          </div>

        </div>
      </div>
    </div>
  );
}

export default Gallery;
