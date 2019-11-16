const logger = require('winston');
logger.level = "debug";

const bitcoin = require('bitcoinjs-lib'), apiCall = require("../src/apiCall.js");
const wallet =
    {
        address: '1AjaQ4erWV3ae3PHNrnennp4FqUF6JA6FN',
        wif: 'L4W5rAyW5oJd1ygk8RS9iPUJVoP1wcBP7g9vJ4wsGbDiSTUgriDw'
    };

let query = "https://blockchain.info/address/" + wallet.address + "?format=json";


apiCall.getData(query).then((blockchaindata) => {
    for (let transactionIndex = 0; transactionIndex < blockchaindata.txs.length; transactionIndex++) {
        for (let outputsIndex = 0; outputsIndex < blockchaindata.txs[transactionIndex].out.length; outputsIndex++) {
            if (blockchaindata.txs[transactionIndex].out[outputsIndex].addr == wallet.address) {
                const out = blockchaindata.txs[transactionIndex].out[outputsIndex];

                console.log(blockchaindata.txs[transactionIndex]);
            }
        }
        //   console.log(data.txs[q]);
    }
});
let tx = new bitcoin.TransactionBuilder();
