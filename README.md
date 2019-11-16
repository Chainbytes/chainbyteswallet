# Chainbyteswallet
[![npm package](https://nodei.co/npm/chainbyteswallet.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/chainbyteswallet/)

[![NPM Version][npm-image]][npm-url]
[![Downloads Stats][npm-downloads]][npm-url]
[![Gitter](https://img.shields.io/badge/gitter-join_chat-blue.svg?style=flat-square)](https://gitter.im/chainbyteswallet)

Created by ChainBytes team. ChainBytes is a software and hardware development company , developing blockchain software solutions and Bitcoin ATM kiosks. If you need a more personalized wallet white-labeled for your brand or additional coins support you can contact us via: www.chainbytes.com 

# Simple Standalone Wallet

## Installation

```
npm install chainbyteswallet --save
```
## To Use

```
// Must set the address and wif to your public address and private key to send from

const wif='';
const address = '';
const wallet = require("chainbyteswallet");
const payor = {"address": address, "wif": wif};
const payee = [{"name": "Person1", "wallet": "1983LDmpGo1iBjz9AAqNEStcaGiya8Wx8N", "amount": 5},
                {"name": "Person2", "wallet": "17J1VUivqLNzw89k5aEfZz3rBk9Pg7hWyY", "amount": 5}]


// 2 people paid $5 USD worth of btc name,wallet,amount array of bitcoin wallets to send usdAmount to.
wallet.pushPayment(payee,payor,'text in transaction opcode').then((result)=> {
    console.log(result);
})
wallet.getAccount(payee[0].wallet).then((result) => {
    console.log(result)  // Show transaction of payments to that address
})
```

## Tests
### Mocha tests
```
npm test
```
## Contributing

Please read [CONTRIBUTING.md](https://github.com/chainbytes/chainbyteswallet/blob/master/contributing.md) for details on our code of conduct, and the process for submitting pull requests to us.

<!-- Markdown link & img dfn's -->
[npm-image]: https://img.shields.io/npm/v/chainbyteswallet.svg?style=flat-square
[npm-url]: https://npmjs.org/package/chainbyteswallet
[npm-downloads]: https://img.shields.io/npm/dm/chainbyteswallet.svg?style=flat-square
[wiki]: https://github.com/hitsnorth/chainbyteswallet/wiki
