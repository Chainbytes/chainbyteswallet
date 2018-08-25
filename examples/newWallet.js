const bitcoin = require('bitcoinjs-lib')
const pushtx = require('blockchain.info/pushtx')

const apiCall = require('../src/apiCall.js')
const walletService = require('../src/wallet.js')

const messageToSend = 'chainbytes: { action: "create" }'
const data = new Buffer(messageToSend)

const wallet = {
  address: '1AjaQ4erWV3ae3PHNrnennp4FqUF6JA6FN',
  wif: 'L4W5rAyW5oJd1ygk8RS9iPUJVoP1wcBP7g9vJ4wsGbDiSTUgriDw',
}

let query = 'https://blockchain.info/address/' + wallet.address + '?format=json'

const payee = [
  { name: 'Person1', wallet: '1MGjwYmN66XPptX2rCuxaMSKWDkgCTS1R3', amount: 1 },
  { name: 'Person2', wallet: '1MGjwYmN66XPptX2rCuxaMSKWDkgCTS1R3', amount: 1 },
]

async function newWallet() {
  try {
    await walletService.pushPayment(payee, wallet, 'Make it so')

    let blockchaindata = await apiCall.getData(query)
    let key = bitcoin.ECPair.fromWIF(wallet.wif)
    let tx = new bitcoin.TransactionBuilder()
    let total = 0 // Total of outputs so we know to send remainder back to our public address
    let amount = 1000

    for (let transaction of blockchaindata.txs) {
      for (let [index, output] of transaction.out.entries()) {
        if (output.addr == wallet.address) {
          if (!output.spent && total < amount) {
            if (output.value > amount) {
              total = total + Number(output.value)
              transaction.addInput(transaction.hash, index)
            }
          }
        }
      }
    }

    tx.addOutput('1MGjwYmN66XPptX2rCuxaMSKWDkgCTS1R3', 15000)

    let fee = await walletService.calculateFee(tx)

    tx.addOutput(wallet.address, Number(total - (amount + fee)))

    let ret = bitcoin.script.compile([bitcoin.opcodes.OP_RETURN, data])
    tx.addOutput(ret, 0)

    key = bitcoin.ECPair.fromWIF(wallet.wif)
    tx.sign(0, key)

    await pushtx.pushtx(tx.build().toHex(), null)
  } catch (e) {
    console.error(e)
  }
}

module.exports = newWallet
