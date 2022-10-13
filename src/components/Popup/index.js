import classNames from "classnames/bind";
import { useState } from "react";
import styles from "./Popup.scss";

function Popup({ handleClosePopup, title = "Notify", content }) {
  const handleCloseClick = () => {
    handleClosePopup();
  };

  return (
    <div className="wrapper-popup">
      <div className="content-popup">
        <div onClick={handleCloseClick} className="close-btn">
          Close
        </div>
        <div className="title-notify">{title}</div>
        <div className="main-content">{content}</div>
      </div>
    </div>
  );
}

export default Popup;
