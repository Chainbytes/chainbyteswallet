const bitcoin = require('bitcoinjs-lib');
const blockexplorer = require('blockchain.info/blockexplorer');
const logger = require('winston');
logger.level = 'debug';
const apiCall = require('../src/apiCall.js');
const pushtx = require('blockchain.info/pushtx');

const calcSize = (Transaction) => {
    const txSize = (Transaction.__TX.ins.length * 180 + Transaction.__TX.outs.length * 34 + 10 + -Transaction.__TX.ins.length);
    return txSize; // Transaction size in Bytes
};

const calcFee = async (Transaction, feeType) => {
    const size = calcSize(Transaction);
    const query = 'https://bitaps.com/api/fee';

    const feeData = await apiCall.getData(query);
    const feeBase = feeData[feeType] || feeData.low || 0;

    if (size * feeBase < 2000) {  // Minimum relay fee
        return 2000;
    }

    return size * feeBase;
};

const pushPay = async (payees, payor, opcode) => {
    if (!payor.address) {
        return Promise.reject(
            new Error('Payor address is required')
        );
    }

    if (!opcode) {
        opcode = 'Chainbyteswallet';
    }

    const data = Buffer.from(opcode);
    const query = 'https://blockchain.info/address/' + payor.address + '?format=json';

    const [btcprice, blockchaindata] = await Promise.all([
        apiCall.getData('https://www.bitstamp.net/api/ticker/'),
        apiCall.getData(query)
    ]);

    const priceBTC = btcprice.ask;
    const key = bitcoin.ECPair.fromWIF(payor.wif); // TODO: Support other private keys
    const tx = new bitcoin.TransactionBuilder();

    let amount = 0;

    payees.forEach((payee) => {
        payee.btcamount = Number(((payee.amount / priceBTC) * 100000000).toFixed(0));
        logger.info('Sending ', payee.btcamount);
        amount += payee.btcamount;  // probably a cleaner way to do this
    });

    let Total = 0;  // Total of outputs so we know to send remainder back to our public address

    for (let transactionIndex = 0; transactionIndex < blockchaindata.txs.length; transactionIndex++) {
        for (let outputsIndex = 0; outputsIndex < blockchaindata.txs[transactionIndex].out.length; outputsIndex++) {
            if (blockchaindata.txs[transactionIndex].out[outputsIndex].addr != payor.address)
                continue;

            const out = blockchaindata.txs[transactionIndex].out[outputsIndex];
            if (!out.spent && Total < amount && out.value > amount) {
                Total += Number(out.value);
                logger.log('info', 'need %d for %d out value total: %d', amount, out.value, Total);
                tx.addInput(blockchaindata.txs[transactionIndex].hash, outputsIndex);
            }
        }
        //   console.log(data.txs[q]);
    }

    if (opcode) {
        const ret = bitcoin.script.compile([
            bitcoin.opcodes.OP_RETURN,
            data
        ]);
        tx.addOutput(ret, 0);
    }

    if (Total < amount && process.env.NODE_ENV != undefined) {
        return Promise.reject('Not enough coin to pay total ' + Total + '  ' + amount);
    }

    logger.log('debug', 'Total: ' + Total);
    logger.log('debug', 'Amount: ' + amount);

    payees.forEach((payee) => {
        logger.log('debug', payee);
        tx.addOutput(payee.wallet, payee.btcamount);
    });

    const fee = await calcFee(tx);

    tx.addOutput(payor.address, Number(Total - (amount + fee)));
    tx.sign(0, key);

    logger.log('debug', 'Fee: ' + fee);
    logger.log('info', 'Sending back %d', Number(Total - amount - fee));
    logger.log('info', tx);

    const lengthTransaction = tx.build().toHex().length / 2;
    console.log('Transaction size: ', lengthTransaction);

    if (process.env.NODE_ENV === undefined || process.env.NODE_ENV === 'production') {  // if there is no NODE_ENV its in production and actually send
        logger.log('info', 'Sending');
        await pushtx.pushtx(tx.build().toHex(), null);
    } else {
        logger.log('info', 'Dev environment not sending');
    }

    return amount;
};

const getAddress = () => {
    const keyPair = bitcoin.ECPair.makeRandom();
    return {address: keyPair.getAddress(), wif: keyPair.toWIF()};
};

const sendPay = async (recipient, wif, amount, opcode) => {
    const data = Buffer.from(opcode)
    const key = bitcoin.ECPair.fromWIF(wif); // TODO: Support other private keys
    const payor = bitcoin.payments.p2pkh({pubkey: key.publicKey})
    //console.log(bitcoin.payments.p2pkh({ pubkey: key.publicKey }))
    //console.log(payor.address)
    const query = 'https://blockchain.info/address/' + payor.address + '?format=json'
    // console.log(query)
    const [btcprice, blockchaindata] = await Promise.all([
        apiCall.getData('https://www.bitstamp.net/api/ticker/'),
        apiCall.getData(query)
    ]);
    const tx = new bitcoin.TransactionBuilder();
    let Total = 0;  // Total of outputs so we know to send remainder back to our public address
    amount = amount * 100000000
    for (let transactionIndex = 0; transactionIndex < blockchaindata.txs.length; transactionIndex++) {
        for (let outputsIndex = 0; outputsIndex < blockchaindata.txs[transactionIndex].out.length; outputsIndex++) {
            if (blockchaindata.txs[transactionIndex].out[outputsIndex].addr != payor.address)
                continue;
            const out = blockchaindata.txs[transactionIndex].out[outputsIndex];
            if (!out.spent && Total < amount && out.value > amount) {
                Total += Number(out.value);
                logger.log('info', 'need %d for %d out value total: %d', amount, out.value, Total);
                tx.addInput(blockchaindata.txs[transactionIndex].hash, outputsIndex);
            }
        }
        //   console.log(data.txs[q]);
    }

    if (opcode) {
        const ret = bitcoin.script.compile([
            bitcoin.opcodes.OP_RETURN,
            data
        ]);
        tx.addOutput(ret, 0);
    }

    if (Total < amount && process.env.NODE_ENV != undefined) {
        return Promise.reject('Not enough coin to pay total ' + Total + '  ' + amount);
    }

    logger.log('debug', 'Total: ' + Total);
    logger.log('debug', 'Amount: ' + amount);

    tx.addOutput(recipient, amount);

    const fee = await calcFee(tx);
    console.log(fee)
    tx.addOutput(payor.address, Number(Total - (amount + fee)));
    tx.sign(0, key);

    logger.log('debug', 'Fee: ' + fee);
    logger.log('info', 'Sending back %d', Number(Total - amount - fee));
    logger.log('info', tx);

    const lengthTransaction = tx.build().toHex().length / 2;
    console.log('Transaction size: ', lengthTransaction);

    if (process.env.NODE_ENV === undefined || process.env.NODE_ENV === 'production') {  // if there is no NODE_ENV its in production and actually send
        logger.log('info', 'Sending');
        //  await pushtx.pushtx(tx.build().toHex(), null);
    } else {
        logger.log('info', 'Dev environment not sending');
    }

    return amount;
};

const getAccount = (bitcoinAddress) => {
    return blockexplorer.getAddress(bitcoinAddress);
};
const getNewPublic = (wif) => {
    const key = bitcoin.ECPair.fromWIF(wif); // TODO: Support other private keys
    return  bitcoin.payments.p2pkh({pubkey: key.publicKey}).address
}
module.exports = {
    getNewAddress: getAddress, // get new address and wif for wallet
    calculateSize: calcSize, // Get size of Transaction
    calculateFee: calcFee, // feeType low,medium,high
    pushPayment: pushPay, // send payment to multiple payees with usd amount, also has opcode support for 'comments'
    sendPayment: sendPay,
    getAccount: getAccount, // Get transaction information and balance for address
    getNewPublic: getNewPublic, //  Get New public address based on wif
};

