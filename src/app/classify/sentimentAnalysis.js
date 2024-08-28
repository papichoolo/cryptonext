import { ChatGroq } from "@langchain/groq";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";

const topCryptos = [
    "Bitcoin", "Ethereum", "Tether USD", "BNB", "Solana", "USDC", "XRP", "Lido Staked Ether",
    "Toncoin", "Dogecoin", "Cardano", "TRON", "Wrapped liquid staked Ether 2.0", "Wrapped BTC",
    "Avalanche", "Shiba Inu", "Wrapped Ether", "Polkadot", "Bitcoin Cash", "Chainlink", "Dai",
    "Uniswap", "Litecoin", "Polygon", "Binance-Peg BSC-USD", "Kaspa", "Wrapped eETH",
    "Internet Computer (DFINITY)", "PEPE", "USDe", "Ethereum Classic", "Monero", "PancakeSwap",
    "Aptos", "NEAR Protocol", "Immutable X", "Fetch.AI", "OKB", "Stacks", "Filecoin", "Bittensor",
    "Stellar", "First Digital USD", "Mantle", "Hedera", "VeChain", "WhiteBIT Coin", "Render Token",
    "EnergySwap", "Maker",'BRETT', 'The Doge NFT', 'DEGEN', 'TOSHI', 'doginme', 'Normie',
    'OmniCat', 'Marvin', 'RealGOAT', 'Mister Miggles', 'Basenji', 'Filecoin',
    'UPSIDE DOWN MEME', 'SPX6900', '$MFER', 'ChompCoin', 'SKOP Token',
    'Marso.Tech', 'Keyboard Cat', 'higher', 'donotfomoew', 'Pepe',
    'Base God', 'Crash', 'BORED', 'Roost Coin', 'BUILD', 'FomoBullClub',
    'Noggles', 'All Street Bets', 'WASSIE', 'DINO', 'Moby', 'Mamba',
    'Shoobadookie', 'Based Street Bets', 'Ski Mask Dog', 'AEROBUD',
    'Fungi', 'FOMO_BASE', 'ROCKY', 'Rug World Assets', 'BlockChainPeople',
    'Apedinbase', 'GameStop on Base', 'Based Shiba Inu', 'Misser',
    'Father Of Meme: Origin', 'Katt Daddy', 'Heroes of memes', 'DERP'
];

const cryptoCategorizer = async (text) => {
    const llm = new ChatGroq({
        apiKey: "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",
        model: "llama3-8b-8192"
    });

    const prompt = ChatPromptTemplate.fromTemplate(`
        Given the following text:
        {text}
        Identify any cryptocurrencies mentioned in the text and categorize them as 'crypto' and the name of The specific Cryptocurrency from this list:
        {topCryptos}
        If no cryptocurrencies are found, categorize the text as 'general'.
        The response should be a list of dictionaries with the following format:
        [
            {{
                "name": "Bitcoin",
                "category": "crypto"
            }},
            {{
                "name": "Ethereum",
                "category": "crypto"
            }},
            {{
                "name": "This text is not about any specific cryptocurrencies",
                "category": "general"
            }}
        ]
        Only write the list. Do not include any other text.
    `);

    const chain = prompt.pipe(llm).pipe(new StringOutputParser());
    const result = await chain.invoke({ text, topCryptos: topCryptos.join(", ") });
    return JSON.parse(result);
};

const getSentiment = async (newsArticle, sentimentScore) => {
    const llm = new ChatGroq({
        apiKey: process.env.GROQ_API_KEY,
        model: "llama3-8b-8192"
    });

    const prompt = ChatPromptTemplate.fromTemplate(`
        You are an expert in Cryptocurrency and have tons of experience in the analysis and speculations in the crypto market. You are given the following news article:
        {newsArticle}
        We are getting the following sentiment from this article:
        {sentiment} with {score} confidence.
        Explain whether this is bullish or bearish and explain the factors that led you to this conclusion.:
    `);

    const chain = prompt.pipe(llm).pipe(new StringOutputParser());
    const result = await chain.invoke({
        newsArticle,
        sentiment: sentimentScore > 0.5 ? "Positive" : "Negative",
        score: sentimentScore
    });
    return result;
};

export { cryptoCategorizer, getSentiment };