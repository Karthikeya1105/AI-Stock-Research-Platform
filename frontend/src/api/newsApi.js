import axios from "axios";

export const getCryptoNews = async (type = "all") => {
  try {
    const response = await axios.get(
      "http://localhost:5000/api/news",
      {
        params: {
          type,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.log(error);

    return [];
  }
};