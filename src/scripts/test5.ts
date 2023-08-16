import {recoverAddress} from 'ethers'


const digest = "0x65f63fc3302edbd3f1ca2116ed249161b6567fff93e68659e2b252145b93ce9b"

const sig = {
    r:"0xf2796c2da0f9ef876104ff25aba99e3d920831ba572310fb51ed244d2abb90d7",
    s:"0x4eac5f8a5e81e0d3a027d6a60f1686b1710855af1bdf4ddfb97b3f54a2ac2552",
    v:27
}

const recover_address = recoverAddress(digest, sig)

console.log(recover_address)