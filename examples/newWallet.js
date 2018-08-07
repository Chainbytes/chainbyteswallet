const bitcoin = require('bitcoinjs-lib'),
  apiCall = require('../src/apiCall.js')
const walletService = require('../src/wallet.js')
const pushtx = require('blockchain.info/pushtx')
const messageToSend = "chainbytes: { action: 'create' }"
const data = new Buffer(messageToSend)
const wallet = {
  address: '1AjaQ4erWV3ae3PHNrnennp4FqUF6JA6FN',
  wif: 'L4W5rAyW5oJd1ygk8RS9iPUJVoP1wcBP7g9vJ4wsGbDiSTUgriDw',
}
let query = 'https://blockchain.info/address/' + wallet.address + '?format=json'
const logger = require('winston')
logger.level = 'debug'
const payee = [
  { name: 'Person1', wallet: '1MGjwYmN66XPptX2rCuxaMSKWDkgCTS1R3', amount: 1 },
  { name: 'Person2', wallet: '1MGjwYmN66XPptX2rCuxaMSKWDkgCTS1R3', amount: 1 },
]

console.log(walletService.getAccount(wallet.address))
/*walletService.pushPayment(payee, wallet, "Make it so").then((result) => {
    console.log(result);
}).catch((err) => {
    console.error(err);
});*/
/*apiCall.getData(query).then((blockchaindata) => {
    let key = bitcoin.ECPair.fromWIF(wallet.wif);
    let tx = new bitcoin.TransactionBuilder();
    let Total = 0;  // Total of outputs so we know to send remainder back to our public address
    let amount = 1000;

    for (let transactionIndex = 0; transactionIndex < blockchaindata.txs.length; transactionIndex++) {
        for (let outputsIndex = 0; outputsIndex < blockchaindata.txs[transactionIndex].out.length; outputsIndex++) {
            if (blockchaindata.txs[transactionIndex].out[outputsIndex].addr == wallet.address) {
                const out = blockchaindata.txs[transactionIndex].out[outputsIndex];
                if (!out.spent && Total < amount) {
                    if (out.value > amount) {
                        Total = Total + Number(out.value);
                        logger.log('info', 'need %d for %d out value total: %d', amount, out.value, Total);
                        tx.addInput(blockchaindata.txs[transactionIndex].hash, outputsIndex);
                    }
                }
            }
        }
        //   console.log(data.txs[q]);
    }
    tx.addOutput("1MGjwYmN66XPptX2rCuxaMSKWDkgCTS1R3", 15000);
    logger.log('info', amount);
    logger.log('info', Total);
    const fee = walletService.calculateFee(tx).then((fee) => {

        console.log("Fee:", fee);
        logger.log('info', Number(Total - (amount + fee)));
        tx.addOutput(wallet.address, Number(Total - (amount + fee)));
        ret = bitcoin.script.compile(
            [
                bitcoin.opcodes.OP_RETURN,
                data
            ])
        tx.addOutput(ret, 0)
        key = bitcoin.ECPair.fromWIF(wallet.wif);
        tx.sign(0, key);
        const test = false;
        if (!test) {
            pushtx.pushtx(tx.build().toHex(), null).then((result) => {
                logger.log('info', result);
            }).catch(function (err) {
                logger.log('error', err);
            });
        }
    });
});*/
