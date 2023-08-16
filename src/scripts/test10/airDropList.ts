const ExcelJS = require('exceljs');

const airDropFile = 'airdrop_list.xlsx'

export async function getAirDropList(){

    const airDropList:any[] = []
    const workbook = new ExcelJS.Workbook();
     try{
        await workbook.xlsx.readFile(airDropFile)

        // 获取指定的工作表
        const worksheet = workbook.getWorksheet('Sheet1');

        console.log("data total length: ",worksheet._rows.length)

        for(let i=1; i <= worksheet._rows.length; i++){

            const lineNum = i.toString()

            if( worksheet.getCell('C'+lineNum).value === 0){
                const ownerObj = {
                    address: worksheet.getCell('A'+lineNum).value,
                    count: worksheet.getCell('D'+lineNum).value,
                    line:i
                }

                // console.log(ownerObj)
                airDropList.push(ownerObj)
            }

        }

        // console.log("to drop list length: ", airDropList.length)
        return airDropList

    }catch(e:any){
        console.log(e)
        throw e
    }
}

export async function completeAirDrip(line){
    const workbook = new ExcelJS.Workbook();

    try{
        await workbook.xlsx.readFile(airDropFile)
        const worksheet = workbook.getWorksheet('Sheet1');

        let cell = worksheet.getCell('C'+line.toString())
        cell.value = 1

        await workbook.xlsx.writeFile(airDropFile);

    }catch(e:any){
        console.log(e)
        throw e
    }
}

export async function setLeftCount(line, left){
    const workbook = new ExcelJS.Workbook();

    try{
        await workbook.xlsx.readFile(airDropFile)
        const worksheet = workbook.getWorksheet('Sheet1');

        let leftCount = worksheet.getCell('D'+line.toString())
        leftCount.value = left

        await workbook.xlsx.writeFile(airDropFile);

    }catch(e:any){
        console.log(e)
        throw e
    }
}

// (async function(){

//     const airdriplist = await getAirDropList()
//     console.log(airdriplist)

//     await completeAirDrip(2)

// })()
