require('dotenv').config();
process.env.NODE_ENV = 'dev';
const bitcoin = require('bitcoinjs-lib');
const payee = [{'name': 'Person1', 'wallet': '1983LDmpGo1iBjz9AAqNEStcaGiya8Wx8N', 'amount': 66.67},
    {'name': 'Person2', 'wallet': '17J1VUivqLNzw89k5aEfZz3rBk9Pg7hWyY', 'amount': 66.67}];
const should = require('chai').should(),
    wallet = require('../src/wallet.js'),
    newAddress = wallet.getNewAddress();
console.log(newAddress);

describe('Wallet', function () {
    describe('#getNewAddress', () => {
        it('New Bitcoin Address', function () {
            newAddress.should.be.a('object');
        });
    });
    describe('#pushPayment', () => {
        it('Pushing payment with opcode', () => {
            wallet.pushPayment(payee, {address: newAddress.address, wif: newAddress.wif}, 'TestCode').then((result) => {
                result.should.be.a('object');
            });
        });
        it('Pushing payment without opcode', () => {
            wallet.pushPayment(payee, {address: newAddress.address, wif: newAddress.wif}).then((result) => {
                result.should.be.a('object');
            });
        });

    });
    describe('checkingBitcoinAccount', () => {
        it('getaccount', () => {
            wallet.getAccount('1AjaQ4erWV3ae3PHNrnennp4FqUF6JA6FN').then((result) => {
                result.should.be.a('object');
            });
        });
    });

});
describe('#calculateSize', () => {
    it('checkingSize', () => {
        tx = new bitcoin.TransactionBuilder();
        wallet.calculateFee(tx).then((result) => {
            result.should.be.a('number');
        });
    });
});

