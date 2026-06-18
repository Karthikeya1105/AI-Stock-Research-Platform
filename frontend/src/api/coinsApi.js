import axios from "axios";

export const getCoins = async () => {
  const response = await axios.get(
    "http://localhost:5000/api/coins"
  );

  return response.data;
};