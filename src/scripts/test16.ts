
let amount = 0

function outputNumber(){
        process.stdout.clearLine(-1)
        process.stdout.cursorTo(0);
        process.stdout.write(`${amount}`);
        amount++
}

function count_up(){
    amount = 0
    return setInterval(outputNumber, 1000)
}

async function count_down(count , interval){

    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    

    for(let i=count; i>0; i--){
        process.stdout.clearLine(-1)
        // console.log(i)
        process.stdout.cursorTo(0);
        process.stdout.write(`${i}`);
        await sleep(interval)
    }

    process.stdout.clearLine(-1)
    process.stdout.cursorTo(0);
}

async function main() {

    // await count_down(10, 1000)
    count_up()

}




main()
    .then(() => process.exit(0))
    .catch(error => {
    console.error(error);
    process.exit(1);
    });