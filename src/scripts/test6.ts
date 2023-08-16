import { ethers, randomBytes , Wallet, SigningKey } from 'ethers';

// 生成一个随机的私钥
const privateKey = randomBytes(32);

// 通过私钥生成钱包
const signingKey = new SigningKey(privateKey)
const wallet = new Wallet(signingKey);

// 获取以太坊地址
const address = wallet.address;

console.log('私钥:', privateKey);
console.log('地址:', address);