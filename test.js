import Compiler from './compiler.js'
import Device from './index.js'

const c1 = new Compiler()
const d =  new Device();


// X=7
// Y=9

// TODO: NOT WORKING x * 4 + y * 3
    // compile error mi1tomem memtomi1
c1.parse(
    `
    ctomi1 5
    pushmi1 0
    popmi1 0
    mi1tomem 21
    ctomi1 4
    pushmi1 0
    memtomi1 21
    pushmi1 0
    ctomi1 1
    pushmi1 0
    popmi2 0
    popmi1 0
    mosubtomi1
    pushmi1 0
    popmi2 0
    popmi1 0
    mosumtomi1
    pushmi1 0
    popmi1 0
    mi1tomem 22
    memtomi1 21
    pushmi1 0
    popmi1 0
    mi1tomem 23
    memtomi1 22
    pushmi1 0
    memtomi1 21
    pushmi1 0
    popmi2 0
    popmi1 0
    mosumtomi1
    pushmi1 0
    popmi1 0
    mi1tomem 21
    memtomi1 23
    pushmi1 0
    ctomi1 6
    pushmi1 0
    popmi2 0
    popmi1 0
    mosumtomi1
    pushmi1 0
    ctomi1 3
    pushmi1 0
    popmi2 0
    popmi1 0
    mosubtomi1
    pushmi1 0
    popmi1 0
    mi1tomem 22
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

runTicks(50)
console.log('mi1: ', d.mi1)
console.log('mi2: ',d.mi2)
console.log('mem:', d.datamem)
console.log('ra:', d.ra)