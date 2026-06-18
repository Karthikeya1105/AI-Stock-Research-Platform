const axios = require("axios");

async function get(
  url,
  config = {},
  retries = 5,
  delay = 6000
) {

  const targetConfig = {
    ...config,
    headers: {
      ...config.headers,
      "x-cg-demo-api-key": process.env.COINGECKO_API
    }
  };


  try {

    return await axios.get(
      url,
      targetConfig
    );


  } catch (error) {


    if (
      error.response?.status === 429 &&
      retries > 0
    ) {

      console.log(
        `Rate limit. Retrying after ${delay / 1000}s`
      );


      await new Promise(
        resolve =>
          setTimeout(resolve, delay)
      );


      return get(
        url,
        config,
        retries - 1,
        delay * 2
      );

    }


    console.log(
      "CoinGecko Error:",
      error.response?.data
    );


    throw error;

  }

}


module.exports = {
  get
};