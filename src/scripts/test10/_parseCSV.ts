const csvtojson = require('csvtojson');
const createCsvWriter = require("csv-writer").createObjectCsvWriter

let results:any[] = [];




(async function() {

    const data = await csvtojson().fromFile('./filt_data.csv');
    for(const item of data) {
        results.push(item)
    }
    
    // console.log(results)



})()