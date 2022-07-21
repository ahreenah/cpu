import Compiler from './compiler.js'
import Device from './index.js'

const c1 = new Compiler()
const d =  new Device();


// X=7
// Y=9

// TODO: NOT WORKING x * 4 + y * 3
c1.parse(`
ctomi2 7
pushmi2 5
ctomi2 4
pushmi2 5
popmi2
popmi1
momultomi1 
pushmi1 5

ctomi1 9
pushmi1 5
ctomi1 3
pushmi1 5
popmi2
popmi1
momultomi1
pushmi1 5
popmi2
popmi1
mosumtomi1
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

runTicks(12)
console.log('mi1: ', d.mi1)
console.log('mi2: ',d.mi2)
console.log('mem:', d.datamem)
console.log('ra:', d.ra)