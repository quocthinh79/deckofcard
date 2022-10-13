import { useEffect, useState } from "react";
import { drawACard, shuffleTheCards } from "./untils/request";
import styles from "./Deck.scss";
import classNames from "classnames/bind";
import Card from "./components/Card";
import Popup from "./components/Popup";

const cx = classNames.bind(styles);

function Deck() {
  //   const [userA, setUserA] = useState({
  //   id: 0,
  //   name: "You",
  //   coins: 5000,
  //   cards: [],
  //   point: 0,
  // });
  // const [userB, setUserB] = useState({
  //   id: 1,
  //   name: "User B",
  //   coins: 5000,
  //   cards: [],
  //   point: 0,
  // });
  // const [userC, setUserC] = useState({
  //   id: 2,
  //   name: "User C",
  //   coins: 5000,
  //   cards: [],
  //   point: 0,
  // });
  // const [userD, setUserD] = useState({
  //   id: 3,
  //   name: "User D",
  //   coins: 5000,
  //   cards: [],
  //   point: 0,
  // });
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
  const [deckId, setDeckId] = useState();
  const [scoreState, setScoreState] = useState(0);
  const [winner, setWinner] = useState(null);
  const [playerListState, setPlayerListState] = useState([
    { ...userA },
    { ...userB },
    { ...userC },
    { ...userD },
  ]);
  const [checkCard, setCheckCard] = useState(false);
  const [closePopup, setClosePopup] = useState(true);
  const [titlePopup, setTitlePopup] = useState("");
  const [contentPopup, setContentPopup] = useState("");
  const [remaining, setRemaining] = useState(52);
  const [finish, setFinish] = useState(false);
  const [calcRemaining, setCalcRemaining] = useState(
    52 % (playerListState.length * 3)
  );

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

  const handleDrawnClick = async (deckId) => {
    // Reset
    // setPlayerListState([]);
    // playerList = [...playerListState];
    const listPlayerChecked = playerListState.filter(
      (item) => item.coins >= 900
    );
    setCalcRemaining(52 % (listPlayerChecked.length * 3));
    if (listPlayerChecked.length <= 1) {
      setTitlePopup("Winner");
      setContentPopup(listPlayerChecked[0].name);
      setClosePopup(false);
      setFinish(true);
    } else {
      setCheckCard(false);
      for (let j = 0; j < listPlayerChecked.length; j++) {
        listPlayerChecked[(j + 1) % listPlayerChecked.length].cards = [];
      }
      // Drawn
      for (let i = 0; i < 3; i++) {
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
            listPlayerChecked[(j + 1) % listPlayerChecked.length].cards.push(
              res.cards[0]
            );
            setRemaining(res.remaining);
          } else {
            setTitlePopup("Error");
            setContentPopup("Not enough cards from the deck");
            setClosePopup(false);
            // console.log(res);
            break;
          }
        }

        // if (listPlayerChecked.length > 2) {
        //   setPlayerListState((pre) => [
        //     ...pre.slice(0, i),
        //     { ...listPlayerChecked[i], point: 0 },
        //     ...pre.slice(i + 1),
        //   ]);
        // } else {
        setPlayerListState(listPlayerChecked);
        // }
      }
    }
  };

  const handleRevealClick = () => {
    let maxValue = 0;
    playerListState.forEach((item, index) => {
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
      setPlayerListState((pre) => [
        ...pre.slice(0, index),
        { ...item, point: score },
        ...pre.slice(index + 1),
      ]);
      if (score % 10 > maxValue % 10) {
        maxValue = score;
        setWinner(item);
        setContentPopup(item.name);
        if (score % 10 === maxValue % 10) {
          setWinner((pre) => ({ ...pre, item }));
        }
      }
      setScoreState(maxValue);
      setCheckCard(true);
    });
    setClosePopup(false);
    setTitlePopup("Winner");
  };

  const subtrac = () => {
    !finish &&
      playerListState.map((item, index) => {
        console.log(item.point);
        if (item.point % 10 !== scoreState % 10) {
          setPlayerListState((pre) => [
            ...pre.slice(0, index),
            { ...item, coins: item.coins - 900 },
            ...pre.slice(index + 1),
          ]);
        }
      });
  };

  const handleShuffleClick = async () => {
    const resShuffleTheCards = await shuffleTheCards({
      params: {
        deck_count: 1,
      },
    });
    setDeckId(resShuffleTheCards.deck_id);
    setRemaining(resShuffleTheCards.remaining);
  };

  const handleResetClick = () => {
    setPlayerListState([
      { ...userA },
      { ...userB },
      { ...userC },
      { ...userD },
    ]);
    handleShuffleClick();
    setFinish(false);
  };

  const handleClosePopup = () => {
    subtrac();
    if (remaining <= calcRemaining) {
      handleShuffleClick();
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
                indexPlayer !== 0 ? (
                  <Card key={indexCard} />
                ) : (
                  <Card key={indexCard} urlImage={item.image} />
                )
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
          <button className="shuffle-btn" onClick={() => handleShuffleClick()}>
            Shuffle
          </button>
          <button
            className="drawn-btn"
            onClick={() => handleDrawnClick(deckId)}
          >
            Drawn
          </button>
          <button className="reveal-btn" onClick={() => handleRevealClick()}>
            Reveal
          </button>
          <button className="reset-btn" onClick={handleResetClick}>
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}

export default Deck;
