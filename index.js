import * as c from  './constants.js'


function processLine(line){

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

    // assign
    get commandCode(){ return (this.progmem[this.cmdAddr]/256)>>0 }
    get commandCondition(){ return this.progmem[this.cmdAddr]%256 } // bits: lt gt eq
    get arg1(){ return (this.progmem[this.cmdAddr+1])>>0 }
    get arg2(){ return (this.progmem[this.cmdAddr+2])>>0 }
    get mosum(){ return this.mi1+this.mi2 }
    get mosub(){ return this.mi1-this.mi2 }
    get mogt(){ return this.mi1>this.mi2}
    get molt(){ return this.mi1<this.mi2}
    get moeq(){ return this.mi1==this.mi2}

    get execute(){ return (
        this.commandCondition==0 ||
        ((this.commandCondition==1) && this.moeq) || 
        ((this.commandCondition==2) && this.mogt) ||
        ((this.commandCondition==4) && this.molt)
    ) }
    loadDatamem(v){
        this.datamem=v;
    }
    // posedge clk
    tick(){
        console.log(`executiong address:`,this.cmdAddr,`  command: `,this.commandCode, `condition: `, this.commandCondition)

        switch(this.commandCode){
            case c.JMP:
                console.log('command JMP');
                if(this.execute)
                    this.cmdAddr = this.arg1;
                else
                    this.cmdAddr+=2;
            return;
            case c.NOP:
                console.log('command NOP')
                this.cmdAddr++;
            break;
            case c.CTOMI1:
                console.log('command CTOMI1, c=',this.arg1);
                if(this.execute)
                    this.mi1 = this.arg1; 
                this.cmdAddr+=2;
            break
            case c.CTOMI2:
                console.log('command CTOMI2, c=',this.arg1);
                if(this.execute)
                    this.mi2 = this.arg1; 
                this.cmdAddr+=2;
            break
            case c.MOSUMTOMI1:
                console.log('command MOSUMTOMI1');
                if(this.execute)
                    this.mi1 = this.mosum; 
                this.cmdAddr++;
            break
            case c.SWPMI:
                console.log('command SWPMI');
                let t = this.mi1;
                this.mi1 = this.mi2;
                this.mi2 = t;
                this.cmdAddr++;
            break
            case c.MOSUBTOMI1:
                console.log('command MOSUBTOMI1');
                if(this.execute)
                    this.mi1 = this.mosub; 
                this.cmdAddr++;
            break
            case c.CTOMEM:
                console.log('command CTOMEM, addr = ',this.arg1, ' data = ',this.arg2);
                if(this.execute)
                    this.datamem[this.arg1] = this.arg2;
                this.cmdAddr+=3;
            break
            case c.MEMTOMI1:
                console.log('command MEMTOMI1, addr = '+this.arg1);
                if(this.execute)
                    this.mi1 = this.datamem[this.arg1]
                this.cmdAddr+=2
            break
            case c.MI1TOMEM:
                console.log('command MI1TOMEM, addr = ',this.arg1);
                if(this.execute)
                    this.datamem[this.arg1] = this.mi1
                this.cmdAddr+=2
            break
            case c.MEMTOMI2:
                console.log('command MEMTOMI2, addr = '+this.arg1);
                if(this.execute)
                    this.mi2 = this.datamem[this.arg1]
                this.cmdAddr+=2
            break
            case c.MI2TOMEM:
                console.log('command MI2TOMEM, addr = ',this.arg1);
                if(this.execute)
                    this.datamem[this.arg1] = this.mi2
                this.cmdAddr+=2
            break
            case c.CTORA:
                console.log("command CTORA")
                this.ra = this.arg1;
                this.cmdAddr+=2;
            break
            case c.INCRA:
                console.log("command INCRA")
                this.ra++;
                this.cmdAddr++;
            break
            case c.DECRA:
                console.log('command DECRA')
                this.ra--;
                this.cmdAddr++;
            break
            case c.MEMRATOMI2:
                console.log("command MEMRATOMI2");
                this.mi2 = this.datamem[this.ra];
                this.cmdAddr+=1;
            break
            case c.MI2TOMEMRA:
                console.log("command MI2TOMEMRA");
                this.datamem[this.ra] = this.mi2;
                this.cmdAddr+=1;
            break
            case c.MI2TORA:
                console.log("command MI2TORA");
                this.ra=this.mi2;
                this.cmdAddr+=1;
            break
            case c.RATOMI2:
                console.log("command RATOMI2");
                this.mi2=this.ra;
                this.cmdAddr+=1;
            break
            case c.MI1TORA:
                console.log("command MI1TORA");
                this.ra=this.mi1;
                this.cmdAddr+=1;
            break
            case c.MI1TOMEMRA:
                this.datamem[this.ra]=this.mi1;
                this.cmdAddr++;
            break
            case c.PUSHMI1:
                console.log('command PUSHMI1')
                this.datamem[this.arg1+this.datamem[this.arg1]+1] = this.mi1
                this.datamem[this.arg1]++
                this.cmdAddr+=2;
            break
            case c.POPMI1:
                console.log('command POPMI1')
                this.mi1 = this.datamem[this.arg1+this.datamem[this.arg1]]
                this.datamem[this.arg1]--
                this.cmdAddr+=2;
            break
            case c.PUSHMI2:
                console.log('command PUSHMI2')
                this.datamem[this.arg1+this.datamem[this.arg1]+1] = this.mi2
                this.datamem[this.arg1]++
                this.cmdAddr+=2;
            break
            case c.POPMI2:
                console.log('command POPMI2')
                this.mi2 = this.datamem[this.arg1+this.datamem[this.arg1]]
                this.datamem[this.arg1]--
                this.cmdAddr+=2;
            break
            case c.PUSHMI1MI2:
                console.log('command PUSHMI1MI2')
                this.datamem[this.arg1+this.datamem[this.arg1]+1] = this.mi2
                this.datamem[this.arg1]++
                this.cmdAddr+=2;
            break
            case c.POPMI1MI2:
                console.log('command POPMI1MI2')
                this.mi2 = this.datamem[this.arg1+this.datamem[this.arg1]]
                this.datamem[this.arg1]--
                this.cmdAddr+=2;
            break
            case c.CALL:
                console.log('command CALL '+this.arg1+' '+this.arg2)
                // jump
                this.cmdAddr=this.arg1;
            break
            case c.RET:
                let addr = this.arg1;
                console.log('command RET '+this.arg1+' '+this.datamem[this.arg1])
                this.cmdAddr = this.datamem[this.arg1+this.datamem[this.arg1]]
                console.log('DEC ADDR '+addr)
                this.datamem[addr]--;
            break
            case c.PUSHADDR:
                console.log('command PUSHADDR '+this.arg1+' '+this.arg2)
                let stackAddr = this.arg1;
                let offset = this.arg2
                
                this.datamem[stackAddr+this.datamem[stackAddr]+1] = this.cmdAddr+offset
                this.datamem[stackAddr]++
                this.cmdAddr+=3;
            break
            case c.SBACKTOMI2:{
                console.log('command SBACKTOMI2 '+this.arg1+' '+this.arg2)
                let stackAddr = this.arg1;
                let offset = this.arg2
                this.mi2 = this.datamem[stackAddr+this.datamem[stackAddr]-offset+1]}
                this.cmdAddr+=3;
            break
            default:
                console.log('unknow command')
                this.cmdAddr++;
        }
        // this.cmdAddr++;
    }
}