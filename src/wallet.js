const bitcoin = require("bitcoinjs-lib");
const blockexplorer = require('blockchain.info/blockexplorer');
const logger = require('winston');
logger.level = "debug";
const apiCall = require('../src/apiCall.js');
const pushtx = require('blockchain.info/pushtx');
let calcSize = (Transaction) => {
    const txSize = (Transaction.tx.ins.length * 180 + Transaction.tx.outs.length * 34 + 10 + -Transaction.tx.ins.length);
    return txSize; // Transaction size in Bytes

}
let calcFee = (Transaction, feeType) => {
    return new Promise((fulfill, reject) => {
        const size = calcSize(Transaction);
        let query = 'https://bitaps.com/api/fee';
        let feeBase = 0;
        apiCall.getData(query).then((feeData) => {
            switch (feeType) {
                case 'medium':
                    feeBase = feeData.medium;
                case 'high':
                    feeBase = feeData.high;
                default:
                    feeBase = feeData.low;
            }
            if (size * feeBase < 20000) {  // Minimum relay fee
                fulfill(20000);
            }
            fulfill(size * feeBase);
        }).catch((err) => {
            reject(err);
        });
    });
}
let pushPay = (payees, payor, opcode) => {
    return new Promise((fulfill, reject) => {
        if (!opcode) {
            opcode = "Chainbyteswallet";
        }
        const data = new Buffer(opcode);
        apiCall.getData("https://www.bitstamp.net/api/ticker/").then((btcprice) => {
            const priceBTC = btcprice.ask;
            let query = "https://blockchain.info/address/" + payor.address + "?format=json";
            apiCall.getData(query).then((blockchaindata) => {
                let key = bitcoin.ECPair.fromWIF(payor.wif); // TODO: Support other private keys
                let tx = new bitcoin.TransactionBuilder();
                let amount = 0;
                payees.forEach((payee) => {
                    payee.btcamount = Number(((payee.amount / priceBTC) * 100000000).toFixed(0));
                    logger.info("Sending ", payee.btcamount);
                    amount = amount + payee.btcamount;  // probably a cleaner way to do this
                });
                let Total = 0;  // Total of outputs so we know to send remainder back to our public address
                for (let transactionIndex = 0; transactionIndex < blockchaindata.txs.length; transactionIndex++) {
                    for (let outputsIndex = 0; outputsIndex < blockchaindata.txs[transactionIndex].out.length; outputsIndex++) {
                        if (blockchaindata.txs[transactionIndex].out[outputsIndex].addr == payor.address) {
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
                if (opcode) {
                    ret = bitcoin.script.compile(
                        [
                            bitcoin.opcodes.OP_RETURN,
                            data
                        ])
                    tx.addOutput(ret, 0);
                }
                if (Total < amount && process.env.NODE_ENV != undefined) {
                    reject("Not enough coin to pay total " + Total + "  " + amount);
                    return;
                }
                logger.log('debug', "Total: " + Total);
                logger.log('debug', "Amount: " + amount);
                payees.forEach((payee) => {
                    logger.log('debug', payee);
                    tx.addOutput(payee.wallet, payee.btcamount);
                });
                calcFee(tx).then((fee) => {
                    tx.addOutput(payor.address, Number(Total - (amount + fee)));
                    logger.log('debug', "Fee: " + fee);
                    logger.log('info', 'Sending back %d', Number(Total - amount - fee));
                    tx.sign(0, key);
                    logger.log("info", tx);
                    const lengthTransaction = tx.build().toHex().length / 2;
                    console.log("Transaction size: ", lengthTransaction);
                    if (process.env.NODE_ENV == undefined) {  // if there is no NODE_ENV its in production and actually send
                        console.log("Sending");
                        pushtx.pushtx(tx.build().toHex(), null).then((result) => {
                            fulfill(amount)
                        }).catch(function (err) {
                            reject(err);
                        });
                    }
                    else {
                        logger.log('info', 'Dev environment not sending');
                        fulfill(amount);
                    }
                })

            });
        })
    });
}
let getAddress = () => {
    const keyPair = bitcoin.ECPair.makeRandom();
    return {address: keyPair.getAddress(), wif: keyPair.toWIF()};
}
let sendPay = (recipient, amount, wif, opcode) => {
    return new Promise((fulfill, reject) => {
        const data = new Buffer(opcode);
    });
}
let getAccount = (bitcoinAddress) => {
    return new Promise((fulfill, reject) => {
        blockexplorer.getAddress(bitcoinAddress).then(function (result) {
            console.log(result)
            fulfill(result);
        }).catch((err) => {
            reject(err);
        });
    });

}
module.exports = {
    getNewAddress: getAddress,  // get new address and wif for wallet
    calculateSize: calcSize,    // Get size of Transaction
    calculateFee: calcFee,     // feeType low,medium,high
    pushPayment: pushPay,  // send payment to multiple payees with usd amount, also has opcode support for "comments"
    sendPayment: sendPay,
    getAccount: getAccount  // Get transaction information and balance for address
};

