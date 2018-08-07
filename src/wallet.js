const bitcoin = require('bitcoinjs-lib')
const blockexplorer = require('blockchain.info/blockexplorer')
const pushtx = require('blockchain.info/pushtx')

const apiCall = require('../src/apiCall.js')

function calculateSize(transaction) {
  return transaction.tx.ins.length * 180 + transaction.tx.outs.length * 34 + 10 + -transaction.tx.ins.length
}

async function calculateFee(transaction, feeType) {
  const size = calculateSize(transaction)
  const query = 'https://bitaps.com/api/fee'

  const feeData = await apiCall.getData(query)
  const feeBase = feeData[feeType] || feeData.low || 0

  let fee = size * feeBase

  if (fee < 20000) {
    fee = 20000
  }

  return fee
}

async function pushPayment(payees, payor, opcode) {
  if (!payor.address) {
    return Promise.reject(new Error('Payor address is required'))
  }

  if (!opcode) {
    opcode = 'Chainbyteswallet'
  }

  const data = Buffer.from(opcode)
  const query = 'https://blockchain.info/address/' + payor.address + '?format=json'

  const [btcprice, blockchaindata] = await Promise.all([apiCall.getData('https://www.bitstamp.net/api/ticker/'), apiCall.getData(query)])

  const priceBTC = btcprice.ask
  const key = bitcoin.ECPair.fromWIF(payor.wif)
  const tx = new bitcoin.TransactionBuilder()

  let amount = 0

  payees.forEach(payee => {
    payee.btcamount = Number(((payee.amount / priceBTC) * 100000000).toFixed(0))
    amount += payee.btcamount
  })

  let total = 0

  for (let transaction of blockchaindata.txs) {
    for (let [index, out] of transaction.out.entries()) {
      if (out.addr != payor.address) continue
      if (!out.spent && total < amount && out.value > amount) {
        total += Number(out.value)
        tx.addInput(transaction.hash, index)
      }
    }
  }

  const ret = bitcoin.script.compile([bitcoin.opcodes.OP_RETURN, data])
  tx.addOutput(ret, 0)

  if (total < amount && process.env.NODE_ENV != undefined) {
    return Promise.reject('Not enough coin to pay total ' + total + '  ' + amount)
  }

  payees.forEach(payee => {
    tx.addOutput(payee.wallet, payee.btcamount)
  })

  const fee = await calculateFee(tx)

  tx.addOutput(payor.address, Number(total - (amount + fee)))
  tx.sign(0, key)

  if (process.env.NODE_ENV === undefined || process.env.NODE_ENV === 'production') {
    // if there is no NODE_ENV its in production and actually send
    await pushtx.pushtx(tx.build().toHex(), null)
  }

  return amount
}

function getNewAddress() {
  const keyPair = bitcoin.ECPair.makeRandom()
  return { address: keyPair.getAddress(), wif: keyPair.toWIF() }
}

function sendPayment(recipient, amount, wif, opcode) {
  return new Promise((fulfill, reject) => {
    console.log(recipient, amount, wif, opcode)
    // const data = Buffer.from(opcode)
    reject('Not yet implemented')
  })
}

function getAccount(bitcoinAddress) {
  return blockexplorer.getAddress(bitcoinAddress)
}

module.exports = {
  getNewAddress, // get new address and wif for wallet
  calculateSize, // Get size of Transaction
  calculateFee, // feeType low,medium,high
  pushPayment, // send payment to multiple payees with usd amount, also has opcode support for 'comments'
  sendPayment,
  getAccount, // Get transaction information and balance for address
}
