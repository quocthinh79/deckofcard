import classNames from "classnames/bind";
import styles from "./Card.scss";
import cardBack from "../../assets/images/card-back.png";

const cx = classNames.bind(styles);

function Card({ urlImage = cardBack, rotate }) {
  return (
    <img
      className={`${cx("card")} ${`${rotate && 'rotate'}`}`}
      width={`160px`}
      height={`248px`}
      src={`${urlImage}`}
    />
  );
}

export default Card;
