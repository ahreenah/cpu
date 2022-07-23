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
    0x00000, 0x0000,// size
    0x000A,0x0002,0x0004,0x0001,0x0003,0x0017,0x0002,0x0010,
    0x0000,0x0000,0x0000,0x0000,0x0000,0x0000,0x0000,0x0000,
])

c1.parse(`
       ctomi1      2            # array 1 start
       ctomi2      8            # array 1 length
       mi2tomem    1            # mem[1] = array length
       ctora       2
       memratomi2
       swpmi
       incra
       memratomi2
       jmp.lt cor     
       cor: nop
`)

console.log(c1.getProgmemByteString())
d.progmem=eval(c1.getProgmemByteString())


// do not sythesize
function runTicks(count){
    for(let i=0; i<count; i++){
        d.tick();
        
        // console.log('mi1: ', d.mi1)
        // console.log('mi2: ',d.mi2)
        // console.log('mem:', d.datamem)
        // console.log('ra:', d.ra)
    }
}

runTicks(190)
console.log('mi1: ', d.mi1)
console.log('mi2: ',d.mi2)
console.log('mem:', d.datamem)
console.log('ra:', d.ra)