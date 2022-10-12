import { useEffect, useState } from "react";
import { drawACard, shuffleTheCards } from "./untils/request";

function Deck() {
  const userA = { id: 0, coins: 5000, cards: [] };
  const userB = { id: 1, coins: 5000, cards: [] };
  const userC = { id: 2, coins: 5000, cards: [] };
  const userD = { id: 3, coins: 5000, cards: [] };
  const playerList = [userA, userB, userC, userD];
  const [deckId, setDeckId] = useState();
  const [scoreState, setScoreState] = useState(0);
  const [winner, setWinner] = useState(null);

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
    for (let j = 0; j < playerList.length; j++) {
      playerList[(j + 1) % 4].cards = [];
    }
    // Drawn
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < playerList.length; j++) {
        const res = await drawACard(
          {
            params: {
              count: 1,
            },
          },
          deckId
        );
        if (res.remaining >= 4) {
          playerList[(j + 1) % 4].cards.push(res.cards[0]);
          // console.log(userA.cards);
          console.log(res.remaining);
        } else {
          console.log(res);
        }
      }
    }
  };

  const handleRevealClick = () => {
    let maxValue = 0;
    playerList.forEach((item, index) => {
      const score = item.cards.reduce(function (total, item) {
        let sum;
        if (Number.isNaN(parseInt(item.value)) && item.value === "ACE") {
          sum = total + 1;
        } else if (Number.isNaN(parseInt(item.value))) {
          sum = total + 10;
        } else {
          sum = total + parseInt(item.value);
        }
        return sum;
      }, 0);
      console.log(score);
      if (score % 10 > maxValue % 10) {
        maxValue = score;
        setWinner(item);
        if (score % 10 === maxValue % 10) {
          setWinner((pre) => ({ ...pre, item }));
        }
      }
      console.log("Max", maxValue);
      console.log("Item", winner);
      setScoreState(maxValue);
    });
  };

  const handleShuffleClick = async () => {
    const resShuffleTheCards = await shuffleTheCards({
      params: {
        deck_count: 1,
      },
    });
    setDeckId(resShuffleTheCards.deck_id);
  };

  const handleResetClick = () => {
    handleShuffleClick();
    playerList.forEach((item, index) => {
      (item.coins = 5000), (item.cards = []);
      setWinner(null);
      setScoreState(null);
      console.log(item);
    });
  };

  return (
    <div>
      <div>{deckId}</div>
      <button onClick={() => handleShuffleClick()}>Shuffle</button>
      <button onClick={() => handleDrawnClick(deckId)}>Drawn</button>
      <button onClick={() => handleRevealClick()}>Reveal</button>
      <button onClick={() => handleResetClick()}>Reset</button>
      <div>{scoreState}</div>
    </div>
  );
}

export default Deck;
