const axios = require("axios");

const translateText = async (text, targetLang) => {
  try {
    if (!text || !targetLang)
      throw new Error("text and targetLang are required");

    const response = await axios.post(
      "https://api-free.deepl.com/v2/translate",
      null,
      {
        params: {
          auth_key: process.env.DEEPL_API_KEY,
          text: text,
          target_lang: targetLang,
        },
      }
    );
    return response.data.translations[0].text;
  } catch (error) {
    console.error("Error translating text:", error);
    throw error;
  }
};

module.exports = {
  translateText,
};
