const ExcelJS = require('exceljs');

const couponFile = "coupon.xlsx"

export async function getUnUsedCoupon(){
    const workbook = new ExcelJS.Workbook();
    try{
        await workbook.xlsx.readFile(couponFile)
        const worksheet = workbook.getWorksheet('coupon');
        // console.log(worksheet._rows.length)
        
        for(let i=1; i <= worksheet._rows.length; i++){
            const used = worksheet.getCell('B'+i.toString()).value

            if(used === 0){
                // console.log(worksheet.getCell('A'+i.toString()).value)
                return {
                    coupon:worksheet.getCell('A'+i.toString()).value,
                    line:i
                }
            }
        }

        return {
            coupon:'',
            line:0
        }

    }catch(e:any){
        console.log(e)
        throw e
    }
}

export async function setCouponUsed(line:number) {
    const workbook = new ExcelJS.Workbook();
    try{
        await workbook.xlsx.readFile(couponFile)
        const worksheet = workbook.getWorksheet('coupon');

        let cell = worksheet.getCell('B'+line.toString())
        cell.value = 1

        await workbook.xlsx.writeFile(couponFile);

    }catch(e:any){
        console.log(e)
        throw e
    }
}