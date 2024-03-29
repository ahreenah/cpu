import * as c from  './constants.js'

class Line{
    label=undefined
    suffix=undefined
    command=''
    args=[]
    addr=0
    get size(){
        return 1 +this.args.length
    }
    get commandCode(){
        return c.commands[this.command.toLocaleUpperCase()]
    }
    get condition(){
        let res = 0;
        for(let i of this.suffix){
            switch(i){
                case 'LT':
                    res+=4;
                break;
                case 'GT':
                    res+= 2;
                break
                case 'EQ':
                    res+= 1;
                break;
            }
        }
        return res;
    }
    get bytes(){
        let res = '0x'+this.commandCode.toString(16).toLocaleUpperCase().padStart(2,'0')+
            '0'+this.condition;
        for(let i of this.args){
            // console.log(i)
            res+=', '+'0x'+(i??0).toString(16).padStart(4,'0')
        }
        return res;
    }
    // get 
}

export default class Compiler{
    test=''
    lines=[]
    labels=[]

    parseLine(s){
        s = s.split('#')[0]
        if(!s.trim())return;
        let l = new Line()
        s = s.trim();
        while(s.indexOf('  ')!=-1){
            s=s.replace('  ',' ')
        }
        let label_command = s.split(':')
        let restString = ''
        if(label_command.length==2){
            l.label=label_command[0]
            restString=label_command[1]
        }
        else{
            restString=label_command[0]
        }
        restString = restString.trim();
        // console.log(restString)

        let parts = restString.split(' ')
        if(parts.length)
            l.command = parts[0]
        for(let i=1; i<parts.length; i++)
            l.args.push(parts[i])
        l.suffix = l.command.split('.')[1]
        let {command, condition}=(function(s){
            // console.log('in f:',s)
            let x=s.split('.').shift()
            return ({
                command:x, 
                condition:s.split('.').filter((i,num)=>num>0)
            })
        })(l.command.toLocaleUpperCase())
        // console.log(l.command.toLocaleUpperCase(), c.commands)
        // console.log(command)
        // console.log(condition)
        l.command=command
        l.suffix=condition
        if(!(c.commands[l.command.toLocaleUpperCase()] || c.commands[l.command.toLocaleUpperCase()]==0))
            throw new Error("Unknown command: "+l.command)
        if(l.args.length!=c.commandArgs[l.command.toLocaleUpperCase()])
            throw new Error(l.command+ " takes " +c.commandArgs[l.command.toLocaleUpperCase()]+" agruments ")
        this.lines.push(l)
        // console.log(l)
    }
    computeAddress(){
        let addr = 0;
        for(let i of this.lines){
            i.addr=addr;
            addr+=i.size
        }
    }
    computeLabels(){
        for(let i of this.lines){
            if(i.label){
                if(this.labels[i.label])
                    throw new Error("Labels cannot be same")
                this.labels[i.label.trim()]=i.addr
            }
        }
    }
    computeJmpAddress(){
        console.log('parsing computeJmpAddress')
        for(let i of this.lines){
            if(i.command=='jmp'){
                console.log('parsing jmp')
                if(!this.labels[i.args[0]])
                    throw new Error("No such label: "+i.args[0])
                i.args[0]=this.labels[i.args[0]]
            }
            if(i.command=='call'){
                console.log('parsing call')
                if(!this.labels[i.args[1]])
                    throw new Error("No such label: "+i.args[1])
                i.args[1]=this.labels[i.args[1]]
            }
        }
    }
    argsToHex(){
        for(let l of this.lines){
            // console.log(l)
            for(let j in l.args)
                if(parseInt(l.args[j]))
                    l.args[j]=parseInt(l.args[j])
                else
                    l.args[j]=this.labels[l.args[j]]
        }
    }
    parse(code){
        try {
            code.split('\n').map(v=>this.parseLine(v))
            this.computeAddress()
            this.computeLabels()
            this.computeJmpAddress()
            this.argsToHex()
            return true
        } catch (E){
            console.log('error',E)
        }   
    }
    getProgmemDump(){
        let res = [];
        for(let l of this.lines){
            for(let k of l.bytes.split(', '))
                res.push(k)
        }
        return res;
    }
    getProgmemByteString(){
        let dump = this.getProgmemDump()
        let res = '['
        for (let i of dump)(res+=i+',')
        res    += ']'
        return res
    }
}

let c1 = new Compiler();