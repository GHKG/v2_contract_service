

const csvtojson = require('csvtojson');
const BigNumber = require('bignumber.js')

const input_file = 'out0.csv'

let minerCounts = {}

export async function main() {


    const data = await csvtojson().fromFile(input_file);
    for(const item of data) {
        const owner = item.owner
        const miner = item.miner
        const method = item.method
        const tokenAddr = item.tokenAddr
        const tokenCount = item.tokenCount
        // const tx = item.tx

        if(!minerCounts[owner]){
            minerCounts[owner] = {}
            minerCounts[owner]["RemoteMinerOnboard"] = []
            minerCounts[owner]["GameMinerOnboard"] = []
        }

        minerCounts[owner][method].push({
            miner: miner,
            tokenAddr: tokenAddr,
            tokenCount: tokenCount,
            // tx:tx
        })
    }

    // console.log(minerCounts)

    const keys = Object.keys(minerCounts);

    // console.log(keys)

    keys.forEach(owner => {
        // console.log(minerCounts[owner]["RemoteMinerOnboard"])
        if(minerCounts[owner]["RemoteMinerOnboard"].length !== 0){
            console.log("\n")

            console.log("owner: ", owner)
            console.log("    game miner count: ", minerCounts[owner]["GameMinerOnboard"].length)
            console.log('    remote miner count: ', minerCounts[owner]["RemoteMinerOnboard"].length)
            
            console.log('        use token: ', "(USDC)")
            
            const remoteMiners = minerCounts[owner]["RemoteMinerOnboard"]
            let luckey = false
            remoteMiners.forEach(item => {
                if(item.tokenAddr === "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174"){
                    // let num = item.tokenCount.toString()
                    // console.log(typeof item.tokenCount, item.tokenCount)
                    // if(num === "1E+21" || num === '1e+21'){
                    //     num = '1000000000000000000000'
                    // }else{
                    //     num = parseFloat(item.tokenCount)
                    // }
                    console.log(`            Miner: ${item.miner}  , tokenCount: ${item.tokenCount}`)
                    luckey = true
                }
            });

            console.log('\n')

            if(luckey){
                console.log('        use token: ', "(ArkreenToken)")
                remoteMiners.forEach(item => {
                    if(item.tokenAddr === "0x960C67B8526E6328b30Ed2c2fAeA0355BEB62A83"){
                        // let num = item.tokenCount.toString()
                        // console.log(typeof item.tokenCount, item.tokenCount)
                        // if(num === "1E+21" || num === '1e+21'){
                        //     num = '1000000000000000000000'
                        // }else{
                        //     num = parseFloat(item.tokenCount)
                        // }
                        console.log(`            Miner: ${item.miner}  , tokenCount: ${item.tokenCount}`)
                    }
                });
            }

        }
    });


}

main()
    .then(() => process.exit(0))
    .catch(error => {
    console.error(error);
    process.exit(1);
    });
    