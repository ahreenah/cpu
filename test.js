import Compiler from './compiler.js'
import Device from './index.js'

const c1 = new Compiler()
const d =  new Device();
// test reverse array
/*
    d.loadDatamem([
        0x00000,0x00000,0x00000,
        0x0000,0x0002,0x0006,0x0A70,0x00C9,0x0235,0x0101,0x1000,
        0x0000,0x0000,0x0000,0x0000,0x0000,0x0000,0x0000,0x0000,
    ])

    c1.parse(`
           ctomi1      7
           mi1tomem    3
    swap:  popmi1 3
           pushmi1     15
           jmp.eq      end
           jmp         swap
    end:   nop
    `)
*/
// test sort array

d.loadDatamem([
    0x0000,0x0000,0x0000,0x0000,0x0000,0x0000,0x0000,0x0000,
    0x0000,0x0000,0x0000,0x0000,0x0000,0x0000,0x0000,0x0000,
    0x0000,0x0000,0x0000,0x0000,0x0000,0x0000,0x0000,0x0000,
])

if(
    c1.parse(`
    ctora 1
    jmp start
    
    after: nop
        incra
        incra
    ret 5
    
    start: nop
    
    call 5 after
    call 5 after

    
    # prc: incra
    # ret 5
    # 
    # after:nop
    # 
    # call 5 pf
    # call 5 4
    # call 5 4
    # 
    # ctomi1 10
    `)
){
    
console.log(c1.getProgmemByteString())
d.progmem=eval(c1.getProgmemByteString())


// do not sythesize
function runTicks(count){
    for(let i=0; i<count; i++){
        d.tick();
        console.log('mem:', d.datamem)
        
        // console.log('mi1: ', d.mi1)
        // console.log('mi2: ',d.mi2)
        // console.log('mem:', d.datamem)
        // console.log('ra:', d.ra)
    }
}

runTicks(15)
console.log('mi1: ', d.mi1)
console.log('mi2: ',d.mi2)
console.log('mem:', d.datamem)
console.log('ra:', d.ra)
}else
    console.log('error')

