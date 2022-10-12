import axios from "axios";

const request = axios.create({
  baseURL: "https://deckofcardsapi.com/api/deck/",
});

export const shuffleTheCards = async (options, urlApi = "new/shuffle/") => {
  const response = await request.get(urlApi, options);
  return response.data;
};

export const drawACard = async (options, deck_id, urlApi = "draw/") => {
  const response = await request.get(`${deck_id}/${urlApi}`, options);
  return response.data;
};
