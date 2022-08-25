import * as c from  './constants.js'


import readline from 'readline';

const rl = readline.createInterface({ input: process.stdin , output: process.stdout });

const getLine = (function () {
    const getLineGen = (async function* () {
        for await (const line of rl) {
            yield line;
        }
    })();
    return async () => ((await getLineGen.next()).value);
})();


function processLine(line){

}

function log(v){

}

export default class Device{
    progmem=[
        /*
            // working no conditions
            0x0200, 0x00021,        // CTOMI1      33
            0x0300, 0x0020,         // CTOMI2      32
            0x0500,                 // MOSUBTOMI1
            0x0600, 0x0002, 0x0004, // CTOMEM      2     4
            0x0800, 0x0005,         // MI1TOMEM    5
            0x0200, 0x0010,         // CTOMI1      16
            0x0700, 0x0005          // MEMTOMI1    5
        */
        
        /*
            // condition test 1 (min or max to mi1, mi2 is not changed)
            0x0200, 0x0019,        // CTOMI1         25
            0x0300, 0x0020,        // CTOMI2         32
            0x0A00, 0x0005,        // MI2TOMEM       5
            // 0x0704, 0x0005      // // MEMTOMI1.lt    5    // uncomment for max
            0x0702, 0x0005         // MEMTOMI1.gt    5    // uncomment for min
        */

        /*
            // condition test 2 (zero mi2 if mi1 = mi2)
            0x0200, 0x0019,        // CTOMI1         32
            0x0300, 0x0019,        // CTOMI2         25
            0x0301, 0x0000         // CTOMI2.eq      0
        */
        
        /* 
            //jump test
            0x0700, 0x0200,        
            0x0000, 0x0000,0x0100, 0x0004, 0x0100, 0x0002
        */

        /*
            // loop test 2 (mod of division mi1 to mi2)
            0x0200, 0x0020,            // CTOMI1         32
            0x0300, 0x0007,            // CTOMI2         7
                                    
            0x0500,                    // MOSUBTOMI1                   
            0x0102, 0x0004             // JMP.gt         4
        */

        /*
            // ra test, sum of elements
            0x0B00, 0x0003,         //    CTORA 3
            0x0E00,                 // s: MEMRATOMI2
            0x0400,                 //    MOSUMTOMI1
            0x0C00,                 //    INCRA
            0x0100, 0x0002          //    JMP s
        */
            0x0200,0x0007,0x0300,0x0009,0x0A00,0x0005,0x0102,0x0009,0x1200,0x0000,
            // 0x0B00,0x0002,0x0E00,0x0C00,0x1200,0x0E00,0x0104,0x000c,0x1400,0x0D00,0x0F00,0x0C00,0x0100,0x0002
        // // start address            //                             
        // 0x0B00, 0x0002,             //          CTORA 2
        //                             //                                 
        // // get two values           //                             
        // 0x0E00,                     //  start:  MEMRATOMI2
        // 0x0C00,                     //          INCRA
        // 0x1200,                     //          SWPMI
        // 0x0E00,                     //          MEMRATOMI2
        // 0x0104, 0x000B,             //          JMP.lt next
        //                             //                                     
        // // swap data cells          //                                         
        // 0x1400,                     //          MI1TOMEMRA
        // 0x0D00,                     //          DECRA
        // 0x0F00,                     //          MI2TOMEMRA
        // 0x0C00,                     //          INCRA 
        // 0x0100, 0x0002,             //  next:   JMP start

        
    ];
    datamem=[
            0x0000,0x0000,0x0000,0x0000,0x0000,0x0000,0x0000,0x0000,0x0000,0x0000,
            0x0000,0x0000,0x0000,0x0000,0x0000,0x0000,0x0000,0x0000,0x0000,0x0000,
            0x0000,0x0000,0x0000,0x0000,0x0000,0x0000,0x0000,0x0000,0x0000,0x0000,
            0x0000,0x0000,0x0000,0x0000,0x0000,0x0000,0x0000,0x0000,0x0000,0x0000,
            0x0000,0x0000,0x0000,0x0000,0x0000,0x0000,0x0000,0x0000,0x0000,0x0000,
            0x0000,0x0000,0x0000,0x0000,0x0000,0x0000,0x0000,0x0000,0x0000,0x0000,
            0x0000,0x0000,0x0000,0x0000,0x0000,0x0000,0x0000,0x0000,0x0000,0x0000,
            0x0000,0x0000,0x0000,0x0000,0x0000,0x0000,0x0000,0x0000,0x0000,0x0000,
            0x0000,0x0000,0x0000,0x0000,0x0000,0x0000,0x0000,0x0000,0x0000,0x0000,
            0x0000,0x0000,0x0000,0x0000,0x0000,0x0000,0x0000,0x0000,0x0000,0x0000,]

    cmdAddr = 0;
    mi1     = 0;
    mi2     = 0;
    ra      = 0;
    sp      = 0;

    // assign
    get commandCode(){ return (this.progmem[this.cmdAddr]/256)>>0 }
    get commandCondition(){ return this.progmem[this.cmdAddr]%256 } // bits: lt gt eq
    get arg1(){ return (this.progmem[this.cmdAddr+1])>>0 }
    get arg2(){ return (this.progmem[this.cmdAddr+2])>>0 }
    get mosum(){ return (this.mi1+this.mi2) % Math.pow(2,32) }
    get mosub(){ 
        if(this.mi1>this.mi2)
            return this.mi1-this.mi2
        else return Math.pow(2,32)+this.mi1-this.mi2
    }
    get momul(){ 
        let mi1v = this.mi1%Math.pow(2,31)
        let mi2v = this.mi2%Math.pow(2,31)
        let mi1s = this.mi1/Math.pow(2,31)>=1
        if(mi1s)
            mi1v = Math.pow(2,31)-mi1v
        let mi2s = this.mi2/Math.pow(2,31)>=1
        if(mi2s)
            mi2v = Math.pow(2,31)-mi2v
        
        // console.log(mi1s,mi1v, mi2s,mi2v)
        let resv = mi1v*mi2v
        let ress = mi1s!=mi2s
        // return ress*Math.pow(2,31)+resv%Math.pow(2,31)
        // console.log(mi1v*mi2v)
        if(!ress)
            return mi1v*mi2v
        return Math.pow(2,32)-mi1v*mi2v
    }
    get mogt(){ return this.mi1>this.mi2}
    get molt(){ return this.mi1<this.mi2}
    get moeq(){ return this.mi1==this.mi2}

    get execute(){ return (
        this.commandCondition==0 ||
        ((this.commandCondition%2>0) && this.moeq) || 
        ((this.commandCondition%4>>1>0) && this.mogt) ||
        ((this.commandCondition%8>>2>0) && this.molt)
    ) }
    loadDatamem(v){
        this.datamem=v;
    }
    // posedge clk
    async tick(){
        // log(`executiong address:`,this.cmdAddr,`  command: `,this.commandCode, `condition: `, this.commandCondition, 'execute: ',this.execute)

        switch(this.commandCode){
            case c.JMP:
                log('command JMP');
                if(this.execute)
                    this.cmdAddr = this.arg1;
                else
                    this.cmdAddr+=2;
            return;
            case c.NOP:
                log('command NOP')
                this.cmdAddr++;
            break;
            case c.CTOMI1:
                log('command CTOMI1, c=',this.arg1);
                if(this.execute)
                    this.mi1 = this.arg1; 
                this.cmdAddr+=2;
            break
            case c.PATOMI1:
                log('command PATOMI1, offset=',this.arg1);
                if(this.execute)
                    this.mi1 = this.sp - this.arg1; 
                this.cmdAddr+=2;
            break
            case c.MEMBYPATOMI1:
                log('command MEMBYPATOMI1, pa=',this.arg1);
                if(this.execute)
                    this.mi1 = this.datamem[this.datamem[this.sp - this.arg1]]; 
                this.cmdAddr+=2;
            break
            case c.MI1TOMEMBYPA:
                log('command MI1TOMEMBYPA, pa=',this.arg1);
                if(this.execute)
                    this.datamem[this.datamem[this.sp - this.arg1]] = this.mi1; 
                this.cmdAddr+=2;
            break
            case c.CTOMI2:
                log('command CTOMI2, c=',this.arg1);
                if(this.execute)
                    this.mi2 = this.arg1; 
                this.cmdAddr+=2;
            break
            case c.MOSUMTOMI1:
                log('command MOSUMTOMI1');
                if(this.execute)
                    this.mi1 = this.mosum; 
                this.cmdAddr++;
            break
            case c.SWPMI:
                log('command SWPMI');
                let t = this.mi1;
                this.mi1 = this.mi2;
                this.mi2 = t;
                this.cmdAddr++;
            break
            case c.MOSUBTOMI1:
                log('command MOSUBTOMI1');
                if(this.execute)
                    this.mi1 = this.mosub; 
                this.cmdAddr++;
            break
            case c.CTOMEM:
                log('command CTOMEM, addr = ',this.arg1, ' data = ',this.arg2);
                if(this.execute)
                    this.datamem[this.arg1] = this.arg2;
                this.cmdAddr+=3;
            break
            case c.MEMTOMI1:
                log('command MEMTOMI1, addr = '+this.arg1);
                if(this.execute)
                    this.mi1 = this.datamem[this.arg1]
                this.cmdAddr+=2
            break
            case c.MI1TOMEM:
                log('command MI1TOMEM, addr = ',this.arg1);
                if(this.execute)
                    this.datamem[this.arg1] = this.mi1
                this.cmdAddr+=2
            break
            case c.MEMTOMI2:
                log('command MEMTOMI2, addr = '+this.arg1);
                if(this.execute)
                    this.mi2 = this.datamem[this.arg1]
                this.cmdAddr+=2
            break
            case c.MI2TOMEM:
                log('command MI2TOMEM, addr = ',this.arg1);
                if(this.execute)
                    this.datamem[this.arg1] = this.mi2
                this.cmdAddr+=2
            break
            case c.CTORA:
                log("command CTORA")
                if(this.execute)
                    this.ra = this.arg1;
                this.cmdAddr+=2;
            break
            case c.INCRA:
                log("command INCRA")
                if(this.execute)
                    this.ra++;
                this.cmdAddr++;
            break
            case c.DECRA:
                log('command DECRA')
                if(this.execute)
                    this.ra--;
                this.cmdAddr++;
            break
            case c.MEMRATOMI2:
                log("command MEMRATOMI2");
                if(this.execute)
                    this.mi2 = this.datamem[this.ra];
                this.cmdAddr+=1;
            break
            case c.MI2TOMEMRA:
                log("command MI2TOMEMRA");
                if(this.execute)
                    this.datamem[this.ra] = this.mi2;
                this.cmdAddr+=1;
            break
            case c.MI2TORA:
                log("command MI2TORA");
                if(this.execute)
                    this.ra=this.mi2;
                this.cmdAddr+=1;
            break
            case c.RATOMI2:
                log("command RATOMI2");
                if(this.execute)
                    this.mi2=this.ra;
                this.cmdAddr+=1;
            break
            case c.MI1TORA:
                log("command MI1TORA");
                if(this.execute)
                    this.ra=this.mi1;
                this.cmdAddr+=1;
            break
            case c.MI1TOMEMRA:
                if(this.execute)
                    this.datamem[this.ra]=this.mi1;
                this.cmdAddr++;
            break
            case c.PUSHMI1:
                log('command PUSHMI1')
                if(this.execute){
                    this.datamem[this.arg1+this.datamem[this.arg1]+1] = this.mi1
                    this.datamem[this.arg1]++
                }
                this.cmdAddr+=2;
            break
            case c.POPMI1:
                log('command POPMI1')
                if(this.execute){
                    this.mi1 = this.datamem[this.arg1+this.datamem[this.arg1]]
                    this.datamem[this.arg1]--
                }
                this.cmdAddr+=2;
            break
            case c.PUSHMI2:
                log('command PUSHMI2')
                if(this.execute){
                    this.datamem[this.arg1+this.datamem[this.arg1]+1] = this.mi2
                    this.datamem[this.arg1]++
                }
                this.cmdAddr+=2;
            break
            case c.POPMI2:
                log('command POPMI2')
                if(this.execute){
                    this.mi2 = this.datamem[this.arg1+this.datamem[this.arg1]]
                    this.datamem[this.arg1]--
                }
                this.cmdAddr+=2;
            break
            case c.PUSHMI1MI2:
                log('command PUSHMI1MI2')
                if(this.execute){
                    this.datamem[this.arg1+this.datamem[this.arg1]+1] = this.mi2
                    this.datamem[this.arg1]++
                }
                this.cmdAddr+=2;
            break
            case c.POPMI1MI2:
                log('command POPMI1MI2')
                if(this.execute){
                    this.mi2 = this.datamem[this.arg1+this.datamem[this.arg1]]
                    this.datamem[this.arg1]--
                }
                this.cmdAddr+=2;
            break
            case c.CALL:
                //TODO: check!
                log('command CALL '+this.arg1+' '+this.arg2)
                // jump
                if(this.execute){
                    this.cmdAddr=this.arg1;
                }
                else
                    this.cmdAddr+=2
            break
            case c.RET:
                //TODO: check!
                let addr = this.arg1;
                log('command RET '+this.arg1+' '+this.datamem[this.arg1])
                if(this.execute){
                    this.cmdAddr = this.datamem[this.arg1+this.datamem[this.arg1]]
                    log('DEC ADDR '+addr)
                    this.datamem[addr]--;
                }
                else
                    this.cmdAddr+=2
                
            break
            case c.PUSHADDR:
                log('command PUSHADDR '+this.arg1+' '+this.arg2)
                let stackAddr = this.arg1;
                let offset = this.arg2
                
                this.datamem[stackAddr+this.datamem[stackAddr]+1] = this.cmdAddr+offset
                this.datamem[stackAddr]++
                this.cmdAddr+=3;
            break
            case c.SBACKTOMI2:{
                    log('command SBACKTOMI2 '+this.arg1+' '+this.arg2)
                    let stackAddr = this.arg1;
                    let offset = this.arg2
                    this.mi2 = this.datamem[stackAddr+this.datamem[stackAddr]-offset+1]
                }
                this.cmdAddr+=3;
            break
            case c.MI2TOSBACK:{
                    log('command MI2TOSBACK '+this.arg1+' '+this.arg2)
                    let stackAddr = this.arg1;
                    let offset = this.arg2
                    this.datamem[stackAddr+this.datamem[stackAddr]-offset+1] = this.mi2 
                }
                this.cmdAddr+=3;
            break
            case c.MALLOC:{
                    log('command MALLOC '+this.arg1+' '+this.arg2)
                    let stackAddr = this.arg1;
                    let size = this.arg2
                    this.datamem[stackAddr] += size 
                }
                this.cmdAddr+=3;
            break
            case c.MFREE:{
                    log('command MFREE '+this.arg1+' '+this.arg2)
                    let stackAddr = this.arg1;
                    let size = this.arg2
                    this.datamem[stackAddr] -= size 
                }
                this.cmdAddr+=3;
            break
            
		    case c.MEMTOSP:
                log('command MEMTOSP '+this.arg1)
                this.sp = this.datamem[this.arg1]
                this.cmdAddr+=2;
            break
            
            case c.MEMSPOFFSETTOMI1:
                log('command MEMSPOFFSETTOMI1 '+this.arg1)
                this.mi1 = this.datamem[this.sp+this.arg1]
                this.cmdAddr+=2;
            break
            
            case c.MEMSPOFFSETTOMI2:
                log('command MEMSPOFFSETTOMI2 '+this.arg1)
                this.mi2 = this.datamem[this.sp+this.arg1]
                this.cmdAddr+=2;
            break
            
            case c.MI1TOMEMSPOFFSET:
                log('command MI1TOMEMSPOFFSET '+this.arg1)
                this.datamem[this.sp+this.arg1] = this.mi1
                this.cmdAddr+=2;
            break
            
            case c.MI2TOMEMSPOFFSET:
                log('command MI2TOMEMSPOFFSET '+this.arg1)
                this.datamem[this.sp+this.arg1] = this.mi2
                this.cmdAddr+=2;
            break

            case c.MI2TOMEMSPNEGOFFSET:
                log('command MI2TOMEMSPNEGOFFSET '+this.arg1)
                this.datamem[this.sp-this.arg1] = this.mi2
                this.cmdAddr+=2;
            break

            case c.MEMSPNEGOFFSETTOMI2:
                log('command MEMSPNEGOFFSETTOMI2 '+this.arg1)
                this.mi2 = this.datamem[this.sp-this.arg1]
                this.cmdAddr+=2;
            break

            
            case c.MI1TOMEMSPNEGOFFSET:
                log('command MI1TOMEMSPNEGOFFSET '+this.arg1)
                this.datamem[this.sp-this.arg1] = this.mi1
                this.cmdAddr+=2;
            break

            case c.MEMSPNEGOFFSETTOMI1:
                log('command MEMSPNEGOFFSETTOMI1 '+this.arg1)
                this.mi1 = this.datamem[this.sp-this.arg1]
                this.cmdAddr+=2;
            break
            
            case c.PUSHSP:
                log('command PUSHSP '+this.arg1)
                this.datamem[this.arg1+this.datamem[this.arg1]+1] = this.sp
                this.datamem[this.arg1]++
                this.cmdAddr+=2;
            break
            
            case c.POPSP:
                log('command POPSP '+this.arg1)
                this.sp = this.datamem[this.arg1+this.datamem[this.arg1]]
                this.datamem[this.arg1]--
                this.cmdAddr+=2;
            break

            
            case c.MOMULTOMI1:
                log('command MOMULTOMI1');
                if(this.execute)
                    this.mi1 = this.momul; 
                this.cmdAddr++;
            break

            // not sythesizable
                case c.PRINT:
                    // console.log('>',this.mi1)
                    let sign = (this.mi1/Math.pow(2,31))>=1
                    let resv = this.mi1%Math.pow(2,31)
                    // console.log(sign,resv)
                    if(sign){
                        resv = Math.pow(2,31)-resv
                        // console.log(resv)
                    }
                    if(sign)
                        process.stdout.write('-'+(resv.toString()));
                    else{
                        // console.log(this.mi1)
                        process.stdout.write(resv.toString());
                    }
                    this.cmdAddr+=1
                break

                case c.PRINTC:
                    // console.log('>',this.mi1)
                    process.stdout.write(String.fromCharCode(this.mi1));
                    this.cmdAddr+=1
                break

                case c.READS:
                    // console.log(this.datamem)
                    let str = await getLine();
                    let chars = []
                    for(let i=0; i<str.length; i++){
                        chars.push(str.charCodeAt(i))
                        this.datamem[this.mi1+i] = str.charCodeAt(i)
                    }
                    chars.push(0)
                    this.datamem[this.mi1+str.length] = 0
                    // console.log('in: '+chars)
                    // console.log('address:',this.mi1)
                    this.cmdAddr+=2;
                    // console.log(this.datamem)
                break   
            


            
            default:
                log('unknow command')
                this.cmdAddr++;
        }
        // this.cmdAddr++;
    }
}