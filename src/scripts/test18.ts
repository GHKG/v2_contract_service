

async function main(){

    new Promise((resolve, reject)=>{
        // resolve(1)
        reject(1)
    }).then(
        value =>{ 
            console.log("resolve_1", value)
            // return Promise.resolve(2)
            // return Promise.reject(3)
            // throw 4
        },
        reason =>{ 
            // console.log("reject_1 ", reason)
            // return Promise.resolve(2)
            // return Promise.reject(3)
            throw 4
        }
    ).then(
        value =>{ console.log("resolve_2", value)},
        reason =>{ console.log("reject_2 ", reason)}
    )
}


main()
    .then()
    .catch(error => {
    console.error(error);
    process.exit(1);
    });