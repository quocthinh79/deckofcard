import { useEffect, useState } from "react";
import { drawACard, shuffleTheCards } from "../../untils/request";
import styles from "./Deck.scss";
import classNames from "classnames/bind";
import Card from "../Card";
import Popup from "../Popup";
import Button from "../Button";

const cx = classNames.bind(styles);

function Deck() {
  // Các user hiện có
  const userA = {
    id: 0,
    name: "You",
    coins: 5000,
    cards: [],
    point: 0,
  };
  const userB = {
    id: 1,
    name: "User B",
    coins: 5000,
    cards: [],
    point: 0,
  };
  const userC = {
    id: 2,
    name: "User C",
    coins: 5000,
    cards: [],
    point: 0,
  };
  const userD = {
    id: 3,
    name: "User D",
    coins: 5000,
    cards: [],
    point: 0,
  };
  const [deckId, setDeckId] = useState(); // ID của bộ bài
  const [scoreState, setScoreState] = useState(0); // Điểm cao nhất của bán bài
  const [winner, setWinner] = useState([]); // Danh sách người chiến thắng
  const [playerListState, setPlayerListState] = useState([
    { ...userA },
    { ...userB },
    { ...userC },
    { ...userD },
  ]); // Danh sách các người chơi
  const [checkCard, setCheckCard] = useState(false); // Kiểm bài
  const [closePopup, setClosePopup] = useState(true); // Đóng popup
  const [titlePopup, setTitlePopup] = useState(""); // Title popup
  const [contentPopup, setContentPopup] = useState(""); // Content popup
  const [remaining, setRemaining] = useState(52); // Số lá bài còn lại
  const [finish, setFinish] = useState(false); // Kiểm tra xuất hiện người chiến thắng cuối cùng
  const [calcRemaining, setCalcRemaining] = useState(
    52 % (playerListState.length * 3)
  ); // Số dư khi thực hiện chia bài
  const [disableButton, setDisableButton] = useState(false); // Disable button

  // Thực hiện call api ngay khi vừa render (Phòng trường hợp vừa bắt đầu người chơi đã chọn xáo bài)
  useEffect(() => {
    const callApi = async () => {
      const resShuffleTheCards = await shuffleTheCards({
        params: {
          deck_count: 1,
        },
      });
      setDeckId(resShuffleTheCards.deck_id);
    };
    callApi();
  }, []);

  // Thực hiện xáo bài
  const handleDrawnClick = async (deckId) => {
    setDisableButton(false); // Hủy disable button kiểm bài khi xáo bài
    // Lọc ra các user có số coins nhỏ hơn 900
    const listPlayerChecked = playerListState.filter(
      (item) => item.coins >= 900
    );
    // Tính toán lại số dư khi chia bài cho người chơi
    setCalcRemaining(52 % (listPlayerChecked.length * 3));
    // Khi người dùng yêu cầu xáo bài mà trong bàn chỉ còn 1 người chơi có đủ coins
    if (listPlayerChecked.length <= 1) {
      setTitlePopup("Winner");
      setContentPopup(listPlayerChecked[0].name);
      setClosePopup(false);
      setFinish(true);
    } else {
      setCheckCard(false);
      // Reset các lá bài trong tay người chơi
      for (let j = 0; j < listPlayerChecked.length; j++) {
        if (listPlayerChecked[0].name !== "You") {
          listPlayerChecked[j % listPlayerChecked.length].cards = [];
        } else {
          listPlayerChecked[(j + 1) % listPlayerChecked.length].cards = [];
        }
      }
      // Drawn
      loop: for (let i = 0; i < 3; i++) {
        for (let j = 0; j < listPlayerChecked.length; j++) {
          const res = await drawACard(
            {
              params: {
                count: 1,
              },
            },
            deckId
          );
          if (res.remaining >= calcRemaining) {
            // Push lá bài 
            if (listPlayerChecked[0].name !== "You") {
              listPlayerChecked[j % listPlayerChecked.length].cards.push(
                res.cards[0]
              );
            } else {
              listPlayerChecked[(j + 1) % listPlayerChecked.length].cards.push(
                res.cards[0]
              );
            }
            setPlayerListState(listPlayerChecked);
            setRemaining(res.remaining);
          } else {
            setTitlePopup("Error");
            setContentPopup("Not enough cards from the deck");
            setClosePopup(false);
            handleShuffleClick();
            break loop;
          }
        }
      }
    }
  };

  // Xử lý kiểm bài
  const handleRevealClick = () => {
    setDisableButton(true);
    setWinner([]);
    let maxValue = 0;
    playerListState.forEach((item, index) => {
      // Tính tổng điểm của mỗi người chơi
      const score = item.cards.reduce(function (total, itemS) {
        let sum;
        if (Number.isNaN(parseInt(itemS.value)) && itemS.value === "ACE") {
          sum = total + 1;
        } else if (Number.isNaN(parseInt(itemS.value))) {
          sum = total + 10;
        } else {
          sum = total + parseInt(itemS.value);
        }
        return sum;
      }, 0);
      // Update lại điểm cho người chơi
      setPlayerListState((pre) => [
        ...pre.slice(0, index),
        { ...item, point: score },
        ...pre.slice(index + 1),
      ]);
      if (score % 10 > maxValue % 10) {
        maxValue = score;
        setWinner([item.name]);
      }
      if (score % 10 === maxValue % 10) {
        // Update và thêm người chiến thắng
        setWinner((pre) =>
          !pre.includes(item.name) ? [...pre, item.name] : [item.name]
        );
      }
      setScoreState(maxValue);
      setCheckCard(true);
    });
  };

  useEffect(() => {
    setTitlePopup("Winner");
    setContentPopup(winner.toString());
    finish ? setClosePopup(false) : (winner.length > 0 ? setClosePopup(false) : setClosePopup(true))
  }, [winner]);

  // Tính toán trừ coins của người thua
  const subtrac = () => {
    !finish &&
      playerListState.map((item, index) => {
        if (item.point % 10 !== scoreState % 10) {
          setPlayerListState((pre) => [
            ...pre.slice(0, index),
            { ...item, coins: item.coins - 900 },
            ...pre.slice(index + 1),
          ]);
        }
      });
  };

  // Xử lý xáo bài
  const handleShuffleClick = async () => {
    setDisableButton(true);
    const resShuffleTheCards = await shuffleTheCards({
      params: {
        deck_count: 1,
      },
    });
    setDeckId(resShuffleTheCards.deck_id);
    setRemaining(resShuffleTheCards.remaining);
    playerListState.map((item, index) => {
      setPlayerListState((pre) => [
        ...pre.slice(0, index),
        { ...item, cards: [] },
        ...pre.slice(index + 1),
      ]);
    });
  };

  // Xử lý reset
  const handleResetClick = async () => {
    setPlayerListState([
      { ...userA },
      { ...userB },
      { ...userC },
      { ...userD },
    ]);
    const resShuffleTheCards = await shuffleTheCards({
      params: {
        deck_count: 1,
      },
    });
    setDeckId(resShuffleTheCards.deck_id);
    setRemaining(resShuffleTheCards.remaining);
    setFinish(false);
    setDisableButton(true);
  };

  // Đóng popup
  const handleClosePopup = () => {
    if (remaining !== 52) {
      subtrac();
    } else {
      handleDrawnClick(deckId);
    }
    setClosePopup(true);
  };

  return (
    <div className={`${cx("wrapper")}`}>
      {!closePopup && (
        <Popup
          title={titlePopup}
          content={contentPopup}
          handleClosePopup={handleClosePopup}
        />
      )}
      {playerListState.map((item, indexPlayer) => (
        <div key={indexPlayer} className={`player-${item.id}`}>
          <div className="wrapper-cards">
            {item.cards.map((item, indexCard) =>
              !checkCard ? (
                <Card key={indexCard} />
              ) : (
                <Card key={indexCard} urlImage={item.image} />
              )
            )}
          </div>
          <div className="infor">
            <div>User ID: {item.id}</div>
            <div>User name: {item.name}</div>
            <div>Point: {item.point}</div>
            {item.coins < 900 ? (
              <div>Coins: Not enough money</div>
            ) : (
              <div>Coins: {item.coins}</div>
            )}
          </div>
        </div>
      ))}
      <div className="wrapper-infor-deck">
        <div className="deck-cards-remaining">Deck cards: {remaining}</div>
        <div>
          <Button className={`shuffle-btn`} func={handleShuffleClick}>
            Shuffle
          </Button>
          <Button
            className={`drawn-btn`}
            func={() => handleDrawnClick(deckId)}
            deckId={deckId}
          >
            Drawn
          </Button>
          <Button
            className={`reveal-btn`}
            disabled={
              playerListState[0].cards.length <= 0 ? true : disableButton
            }
            func={handleRevealClick}
          >
            Reveal
          </Button>
          <Button className={`reset-btn`} func={handleResetClick}>
            Reset
          </Button>
        </div>
      </div>
    </div>
  );
}

export default Deck;
