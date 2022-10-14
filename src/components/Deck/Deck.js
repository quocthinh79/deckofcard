import { useEffect, useState } from "react";
import { drawACard, shuffleTheCards } from "../../untils/request";
import styles from "./Deck.scss";
import classNames from "classnames/bind";
import Card from "../Card";
import Popup from "../Popup";
import Button from "../Button";

const cx = classNames.bind(styles);

function Deck() {
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
  const [winner, setWinner] = useState([]);
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
  const [disableButton, setDisableButton] = useState(false);

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
    // setWinner([]);
    setDisableButton(false);
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

  const handleRevealClick = () => {
    setDisableButton(true);
    setWinner([]);
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
        setWinner([item.name]);
      }
      if (score % 10 === maxValue % 10) {
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
