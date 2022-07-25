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
// test procedure call
/*
    jmp start
    
    adder:nop
        popmi2 5
        mi2tora

        memtomi1 0
        popmi2 5
        mosumtomi1
        mi1tomem 0

        ratomi2
        pushmi2 5
    ret 5
    
    start: nop
        ctomi1 5
        pushmi1 5
        call 5 adder

        
        ctomi1 2
        pushmi1 5
        call 5 adder

 */

d.loadDatamem([
    0x0000,0x0000,0x0000,0x0000,0x0000,0x0000,0x0000,0x0000,
    0x0000,0x0000,0x0000,0x0000,0x0000,0x0000,0x0000,0x0000,
    0x0000,0x0000,0x0000,0x0000,0x0000,0x0000,0x0000,0x0000,
])

if(
    c1.parse(`

    # working example without arguments 
    
    # ctora 1
    # jmp start
    # 
    # after: nop
    #     incra
    #     incra
    # ret 5
    # 
    # start: nop
    # 
    # call 5 after
    # call 5 after

    jmp start
    
    adder:nop
        # pop 2 arguments
        popmi2 5
        popmi1 5

        # calculate sum
        mosumtomi1

        # save return address
        popmi2 5

        # push answer
        pushmi1 5 

        # push return address
        pushmi2 5

    ret 5
    
    start: nop
        # return address + 14 to stack 5
        pushaddr 5 14

        # args - 3, 2
        ctomi1 2
        pushmi1 5
        ctomi1 8
        pushmi1 5

        # call proc
        call adder

        # get result
        popmi1 5


    `)
){
    
console.log(c1.getProgmemByteString())
d.progmem=eval(c1.getProgmemByteString())


// do not sythesize
function runTicks(count){
    for(let i=0; i<count; i++){
        d.tick();
        console.log('mem:', d.datamem)
        
        console.log('mi1: ', d.mi1)
        console.log('mi2: ',d.mi2)
        // console.log('mem:', d.datamem)
        console.log('ra:', d.ra)
    }
}

runTicks(50)
console.log('mi1: ', d.mi1)
console.log('mi2: ',d.mi2)
console.log('mem:', d.datamem)
console.log('ra:', d.ra)
}else
    console.log('error')

