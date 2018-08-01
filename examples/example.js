const wallet = require("../src/wallet.js"),
    newAddress = wallet.getNewAddress() // New wallet nothing will be in it to pay so rest will fail
const payor = {
    "address": newAddress.address,
    "wif": newAddress.wif
}
const payee = [{"name": "Person1", "wallet": "1MGjwYmN66XPptX2rCuxaMSKWDkgCTS1R3", "amount": 1},
    {"name": "Person2", "wallet": "1MGjwYmN66XPptX2rCuxaMSKWDkgCTS1R3", "amount": 1}]
wallet.pushPayment(payee, payor, "Make it so").then((result) => {
    console.log(result);
}).catch((err) => {
    console.error(err);
});
