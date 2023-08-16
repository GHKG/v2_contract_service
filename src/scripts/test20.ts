import { ethers , AlchemyProvider, Contract, JsonRpcProvider } from "ethers";



async function listenToEvents() {
//   const provider = new AlchemyProvider('wss://polygon-mumbai.g.alchemy.com/v2/-A-Bjd0JuIE83vYO-CoK8ESb3j_wPMcp');
  const provider = new JsonRpcProvider('https://polygon-mumbai.g.alchemy.com/v2/-A-Bjd0JuIE83vYO-CoK8ESb3j_wPMcp');

  console.log(await provider.getBlockNumber())
  return
  // 合约地址
  const contractAddress = '0x00642Cb31BD426fD411aC0D19ceC460f9B322570'; // 替换为您要监听的合约地址

  // 合约 ABI
  const contractABI = [
    // 合约 ABI 定义
    "function setValue(uint256) public",

  ];

  // 根据合约地址和 ABI 创建合约实例
  const contract = new Contract(contractAddress, contractABI, provider);

  // 监听合约事件
  contract.on('error', (txHash, status) => {
    console.log(`交易 ${txHash} 在合约 ${contractAddress} 上失败，状态为 ${status}`);
    
    // 可以在这里执行失败交易的处理逻辑
  });
}

listenToEvents()

// async function main(){
//     await listenToEvents()
// }

// main()
//     .then()
//     .catch(error => {
//     console.error(error);
//     process.exit(1);
//     });      