const wallet = require('../src/wallet.js')
const newAddress = wallet.getNewAddress() // New wallet nothing will be in it to pay so rest will fail
const payor = {
  address: newAddress.address,
  wif: newAddress.wif,
}
const payee = [
  { name: 'Person1', wallet: '1MGjwYmN66XPptX2rCuxaMSKWDkgCTS1R3', amount: 1 },
  { name: 'Person2', wallet: '1MGjwYmN66XPptX2rCuxaMSKWDkgCTS1R3', amount: 1 },
]

async function exampleOne() {
  try {
    await wallet.pushPayment(payee, payor, 'Make it so')
  } catch (e) {
    console.error(e)
  }
}

exampleOne()
