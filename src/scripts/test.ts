import { InfuraProvider } from "ethers";
const mongoose = require('mongoose');

const axios = require('axios');

const url_mainnet = 'https://gasstation-mainnet.matic.network/'
const url_testnet = 'https://gasstation-mumbai.matic.today'

const url_mainnet_with_key = "https://api.polygonscan.com/api?module=gastracker&action=gasoracle&apikey=DP59DP1UHEJ4Q4XX4R82M4ZX6KBZ9M676R"
const url_testnet_with_key = "https://api-testnet.polygonscan.com/api?module=gastracker&action=gasoracle&apikey=DP59DP1UHEJ4Q4XX4R82M4ZX6KBZ9M676R"

const provider = new InfuraProvider('matic', '295cce92179b4be498665b1b16dfee34')
async function run(url) {
  axios.get(url)
  .then(response => {
    console.log(response.data);
  })
  .catch(error => {
    console.log(error);
  });
}


export async function getFeeDataFromGastracker(network:string){

    let url = ""
    if(network == "matic"){
        url = url_mainnet
    }

    if(network === "maticmum"){
        url = url_testnet
    }

    try{
      const response = await axios.get(url)
      return response
    }catch(e:any){
      console.log("gas tracker error: \n", e)
    }

}

// run(url_mainnet);

// run(url_testnet)

// run(url_mainnet_with_key)
// run(url_testnet_with_key)
async function main() {
  await getFeeDataFromGastracker('maticmum')
}
main()
    .then(() => process.exit(0))
    .catch(error => {
    console.error(error);
    process.exit(1);
    });

