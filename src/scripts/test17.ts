let count = 0;

function main(){

    // let count = 0;

    function repeatTask() {
    console.log(count);
    count++;
    }

    return setInterval(repeatTask, 1000);
}

const timer = main()
    // .then()
    // .catch(error => {
    // console.error(error);
    // process.exit(1);
    // });

setTimeout(()=>{clearInterval(timer)}, 5000)