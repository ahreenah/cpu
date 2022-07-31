const LineTypes= {
    VAR_BEGIN:"VAR_BEGIN",
    ENTRY_BEGIN:"ENTRY_BEGIN",
    IF_BEGIN:"IF_BEGIN",
    WHILE_BEGIN:"WHILE_BEGIN",
    COMMAND:"COMMAND",
    EQUATION:"EQUATION",
    TYPE_DEFINITION:"TYPE_DEFINITION",
    END:"END",
    FUNC_BEGIN:'FUNC_BEGIN',
    RETURN:'RETURN',
    FUNCVAR_BEGIN:'FUNCVAR_BEGIN',
    FUNC_CALL:"FUNC_CALL",
    FUNC_END:"FUNC_END"
}

const VAR_START_ADDR=21

function assert(v, text){
    if(!v) throw new Error("Assertion error: "+text)
}

class HLCompiler{
    code='';
    textLines=[];
    lines = [];
    variables=[];
    beginCount=0;
    setCode(v){
        // needn't fix for stack
        this.code=v
        this.textLines = this.code.split('\n')
    }
    clearEmptyLines(){
        // needn't fix for stack
        this.textLines = this.textLines.map(i=>i.split('#')[0].trim()).filter(i=>i?.length)
        const signs = ['+','-','>','<','==','!=','(',')','[',']',':',',',';']
        console.log('i',this.textLines)
        signs.map(i=>{
            console.log('sign:',i)
            this.textLines.map((s,num)=>{
                if(s){
                    console.log(num,'->',this.textLines[num],'->',s.replace(i,' '+i+' '))
                    this.textLines[num]=s.replace(i,' '+i+' ')
                }
            })
        })
        console.log('o',this.textLines)
        this.textLines = this.textLines.filter(i=>i?.length).map((i)=>{ 
            console.log('i:',i)
            return i.replace(/\ +/g,' ')
        })
        
        this.lines = this.textLines.map(i=>({text:i}))

        console.log('o',this.textLines)
    }
    parseTypeDefinition(v){
        let ar = v.text.split(':')
        ar[0]=ar[0].trim().split(',').map(i=>i.trim())
        console.log('ar[1]',JSON.stringify(ar[1]))
        console.log( 'groups:',ar[1].match(/(?<type>\w*) ?(\[(?<size>\d+)\])?/).groups)
        let {size, type} = ar[1].trim().match(/(?<type>\w*) ?(\[ (?<size>\d+) \])?/).groups
        console.log("SIZE::::",size)
        v.data={
            variableNames :ar[0],
            variable_type:type,
            size
        }
    }
    parseExpression(v){
        // needn't fix for stack
        // only +, -, >, <, <=, >=, !=
        // only one of >, <, <=, >=, != is allowed
        function calculateOrders(s){
            const mathSigns = ['+','-', '->','*']
            const comparisonSigns = ['>', '<', '<=', '>=', '!=']
            const priorities={
                '>':0,'<':0,'==':0,'!=':0,'<=':0,'>=':0,
                '+':1,'-':1,
                '*':2,
                '->':3
            }
            const signs = [...mathSigns, ...comparisonSigns]
            let tokens = s.split(' ')
            let tmp=[]
            let type="NO_COMPARISON"
            let level=0;
            for (let i of tokens){
                if(i=='('){
                    level++
                }
                else if(i==')'){
                    level--
                }
                else if(signs.indexOf(i)!=-1){
                    tmp.push({type:"SIGN",value:i, level, priority:priorities[i]})
                }
                else{
                    tmp.push({type:"VALUE", value:i})
                }
            }
            // расчет порядка = level*count+priority
            for (let i=0; i<tmp.length; i++){
                if(tmp[i].type=='SIGN')
                    tmp[i].order=tmp[i].level*tmp.length+tmp[i].priority
            }
            return tmp
        }
        function oneStep(ordered){
            // needn't fix for stack
            let maxLevel=0;
            let maxLevelIndex = -1;
            for(let i=0; i<ordered.length; i++){
                if((ordered[i].type=='SIGN') && ordered[i].order>maxLevel ){
                    maxLevel=ordered[i].order;
                    maxLevelIndex=i;
                }
            }
            let tmp=[...ordered];
            tmp[maxLevelIndex]={type:"EXPRESSION",left:tmp[maxLevelIndex-1],sign:tmp[maxLevelIndex].value,right:tmp[maxLevelIndex+1]}
            tmp[maxLevelIndex-1]='UNDEFINED';
            tmp[maxLevelIndex+1]='UNDEFINED';
            tmp= tmp.filter(i=>i!='UNDEFINED')
            return tmp
        }
        let orderedList =  calculateOrders(v)
        let tree=orderedList;
        while(tree.length>3)
            tree=oneStep(tree)
        console.log(tree)
        if (tree.length==1) return tree[0]
        // возвращает дерево
        return {left:tree[0],right:tree[2],sign:tree[1].value, type:'EXPRESSION'}
    }
    treetoPolish(v){
        // needn't fix for stack
        if(v.type=='VALUE')
            return [{type:'VALUE',value:v.value}]
        return [...this.treetoPolish(v.left), ...this.treetoPolish(v.right),{type:'SIGN',value:v.sign}]
    }
    computeVarSection(){
        let typeDefinitions = this.lines.filter(i=>i.type=='TYPE_DEFINITION')
        let data = []
        for(let i of typeDefinitions){
            for(let name of i.data.variableNames){
                data.push({name,type:i.data.variable_type,size:i.data.size})
            }
        }
        let addr = VAR_START_ADDR;
        const baseSizes={
            'unsigned':1
        }
        for(let i of data){
            i.dataMemAddr = addr;
            addr+= baseSizes[i.type]*(i.size??1)
        }
        let used = 0;
        for(let i=data.length-1; i>=0; i--){
            data[i].dataMemAddr = addr;
            data[i].negStOffset = used + baseSizes[data[i].type]*(data[i].size??1) - 1
            used+=baseSizes[data[i].type]*(data[i].size??1)
            addr+= baseSizes[data[i].type]*(data[i].size??1)
        }
        this.variables=data;
    }
    polishToAsm(v, isIf){
        let res = [];
        const STACK_ADDR=0
        for(let i of v){
            if(i.type=='VALUE'){
                let isNumber = !isNaN(+i.value)
                if(isNumber){
                    res.push('ctomi1 '+i.value)
                }
                else{
                    res.push('memspnegoffsettomi1 '+i.value) // TODO:stack sbacktomi1 
                }
                res.push('pushmi1 ' + STACK_ADDR)
            }
            if(i.type=='SIGN'){
                res.push('popmi2 ' + STACK_ADDR)
                res.push('popmi1 ' + STACK_ADDR)
                switch(i.value){
                    case '+': res.push('mosumtomi1'); break;
                    case '-': res.push('mosubtomi1'); break;
                    case '*': res.push('momultomi1'); break;
                }
                // TODO: NOT USED IN IF
                if(!isIf)
                res.push('pushmi1 ' + STACK_ADDR)
            }
        }
        return res;
    }
    globalMalloc(){
        this.lines.unshift({
            text:'malloc ',
            type:'MALLOC',
            asm:[
                'malloc 0 '+(this.variables[0].negStOffset+1),
                'memtosp 0'
            ]
        },)
    }
    parseFunctions(){
        for(let i of this.lines){
            if(i.type==LineTypes.FUNC_BEGIN){
                // while(i.text.indexOf(':')!=-1)
                    i.text = i.text.replace(/\:/g,' : ')
                let arr = i.text.split(' ')
                i.arr = arr
                i.funcName = i.arr[1]
                assert(i.arr[0]=='func', "FUNC ERROR")
                assert(i.arr[2]=='(', "( expected")
                assert(i.arr[i.arr.length-2]==')', ") expected")
                assert(i.arr[i.arr.length-1]=='begin', "begin expected")
                let argSubArray = i.arr.filter((k,num)=>(num>2 && num<(i.arr.length-2)))
                i.subArray = argSubArray
                let argStr = i.subArray.join(' ')
                let argParts = argStr.split(' ; ')
                let argDict={};
                i.argParts=argParts;
                for (let args of argParts){
                    let names = args.split(' : ')[0].split(', ')
                    let type = args.split(' : ')[1]
                    for(let i of names){
                        if(type.indexOf('[')==-1){
                            argDict[i.trim()]={type:type.split('[')[0].trim(),size:1}
                        }else{
                            argDict[i.trim()]={
                                type:type.split('[')[0].trim(),
                                size:parseInt(type.split('[')[1].split(']')[0].trim())
                            }
                        }
                    }
                }
                i.args = argDict
                delete i.argSubArray
                delete i.argParts
                delete i.arr
                delete i.subArray
                delete i.argStr
            }
        }
    }
    funcLocalMalloc(){
        for(let i=0 ;i<this.lines.length; i++){
            if(this.lines[i].type==LineTypes.VAR_BEGIN){
                if(this.lines?.[i-1]?.type==LineTypes.FUNC_BEGIN){
                    console.log('IT IS:')
                    this.lines[i].type=LineTypes.FUNCVAR_BEGIN
                    let j = i+1;
                    this.lines[i-1].localVars={}
                    while(this.lines[j].type==LineTypes.TYPE_DEFINITION){
                        for (let varName of this.lines[j].data.variableNames)
                            this.lines[i-1].localVars[varName]={
                                type:this.lines[j].data.variable_type,
                                size:this.lines[j].data.size??1
                            }

                        j++
                    }
                    // while(true);
                    // this.lines[i]={}
                }
            }
        }
        
    }
    localVarOffset(){
        for(let i of this.lines){
            if(i.type==LineTypes.FUNC_BEGIN){
                let currentOffset = 1;
                
                if(i.localVars){
                    for(let j of Object.keys(i.localVars).reverse()){
                        i.localVars[j].negOffset = parseInt(i.localVars[j].size)+currentOffset - 2;
                        currentOffset+=parseInt(i.localVars[j].size);
                    }
                }
                let localVarNames=Object.keys(i.localVars)
                i.localVarsArr = localVarNames.map(k=>({name:k,...i.localVars[k]}))

                currentOffset+=1;
                
                if(i.args){
                    for(let j of Object.keys(i.args).reverse()){
                        i.args[j].negOffset = parseInt(i.args[j].size)+currentOffset -  2;
                        currentOffset+=parseInt(i.args[j].size);
                    }
                }
                let argNames=Object.keys(i.args)
                i.argsArr = argNames.map(k=>({name:k,...i.args[k]}))

                i.availableMemory=[
                    ...i.argsArr.map(i=>({...i, type:'ARGUMENT'})),
                    ...i.localVarsArr?.map(i=>({...i, type:'LOCAL_VAR', size:parseInt(i.size)})),
                ]
            }
        }
    }
    funcBeginAsm(){
        for(let i of this.lines){
            if(i.type==LineTypes.FUNC_BEGIN){
                i.asm=[
                    //start
                    'jmp func_'+i.funcName+'_end',
                    'func_'+i.funcName+'_begin: nop',
                    '   malloc 0 '+(i.localVarsArr[0].negOffset+1),
                    '   memtosp 0',

                ]
            }
        }
    }
    funcEndAsm(){
        for(let i of this.lines){
            if(i.type==LineTypes.END){
                let begin = this.lines.filter(j=>(j.type==LineTypes.FUNC_BEGIN && j.beginId==i.beginId))[0]
                console.log('begin:',begin)
                if(begin && (begin.type==LineTypes.FUNC_BEGIN)){
                    console.log(begin, i.beginId)
                    // console.log(this.lines)
                    // while(1);
                    i.asm=[
                        //start
                        '   mfree 0 '+(begin.localVarsArr[0].negOffset+1),
                        //save return address
                        '   popmi2 0',
                        // push res
                        '   pushmi1 0',
                        // put return adress back
                        '   pushmi2 0',
                        // end
                        '   ret 0',
                        'func_'+begin.funcName+'_end: nop'
                    ]
                    console.log('start, stop:',this.lines.indexOf(begin), this.lines.indexOf(i))
                    for (let t = this.lines.indexOf(begin); t<=this.lines.indexOf(i); t++){
                        this.lines[t].isInsideFunc = true
                    }
                    i.type=LineTypes.FUNC_END
                }
            }
        }
    }
    fullAsm(){
        // needn't fix for stack
        let res = []
        for(let i of this.lines){
            if(i.asm){
                for(let str of i.asm)
                    res.push(str)
            }
        }
        return res;
    }
    parseLineTypes(){
        // needn't fix for stack
        let  detectLineType=(s)=>{
            if(s.text.startsWith('func')){
                return s.type=LineTypes.FUNC_BEGIN
            }
            if(s.text.startsWith('return')){
                s.asm=['memspnegoffsettomi1 '+s.text.substr(7)]
                return s.type=LineTypes.RETURN
            }
            if(s.text=='var begin')
                return s.type=LineTypes.VAR_BEGIN
            if(s.text=='entry begin')
                return s.type=LineTypes.ENTRY_BEGIN
            if(s.text.startsWith('while ')){
                if(s.text.endsWith(' begin')){
                    let cond = s.text.split('while ')[1].split(' begin')[0]
                    s.cond=this.parseExpression(cond)
                    s.condPolish = this.treetoPolish(s.cond)
                    s.condasm = ['while_'+'ii'+'_begin:nop',...this.polishToAsm(s.condPolish)]
                    s.condasm.push('popmi1 0') // ???
                    let sign = s.condPolish[s.condPolish.length-1].value
                    delete s.cond
                    // вход в цикл
                    if(sign=='=')
                        s.condasm.push('jmp.eq while_'+'ii'+'_inside')
                    if(sign=='<')
                        s.condasm.push('jmp.lt while_'+'ii'+'_inside')
                    if(sign=='>')
                        s.condasm.push('jmp.gt while_'+'ii'+'_inside')
                    // выход из цикла если не вошли
                    s.condasm.push('jmp while_'+'ii'+'_end')
                    // метка начала тела цикла
                    s.condasm.push('while_'+'ii'+'_inside: nop')
                    s.asm = s.condasm
                    return s.type=LineTypes.WHILE_BEGIN
                }
                throw new Error("end is expected")
            }
            if(s.text.startsWith('if')){
                if(s.text.endsWith('begin')){
                    let cond = s.text.split('if ')[1].split(' begin')[0]
                    s.cond=this.parseExpression(cond)
                    s.condPolish = this.treetoPolish(s.cond)
                    s.condasm = this.polishToAsm(s.condPolish, true)
                    let sign = s.condPolish[s.condPolish.length-1].value
                    delete s.cond
                    if(sign=='=')
                        s.condasm.push('jmp.eq if_'+'ii'+'_inside')
                    if(sign=='<')
                        s.condasm.push('jmp.lt if_'+'ii'+'_inside')
                    if(sign=='>')
                        s.condasm.push('jmp.gt if_'+'ii'+'_inside')
                    s.condasm.push('jmp if_'+'ii'+'_end')
                    s.condasm.push('if_'+'ii'+'_inside: nop')
                    s.asm=s.condasm
                    return s.type=LineTypes.IF_BEGIN
                }
                throw new Error("end is expected")
            }
            if(s.text.indexOf(':')!=-1){
                this.parseTypeDefinition(s)
                return s.type=LineTypes.TYPE_DEFINITION
            } 
            if(s.text=='end'){
                return s.type=LineTypes.END
            }
            if(s.text.indexOf('(')!=-1){
                s.left = s.text.split('=')[0].trim()

                s.right = s.text.split('=')[1].trim()
                s.functionName = s.right.split('(')[0].trim()
                s.args = s.right.split('(')[1].split(')')[0].split(',').map(i=>i.trim())
                s.asm=[]
                //stack pointer
                s.asm.push('pushsp 0')
                // args
                for(let i of s.args){
                    s.asm.push('memspnegoffsettomi1 '+i)
                    s.asm.push('pushmi1 0')
                }
                s.asm.push('pushaddr 0 5')
                s.asm.push('call func_'+s.functionName+'_begin')
                //res
                s.asm.push('popmi2 0')
                // clear args
                for(let i of s.args){
                    s.asm.push('popmi1 0')
                }
                s.asm.push('popsp 0')
                s.asm.push('mi2tomemspnegoffset '+s.left)// s.rightPolish = this.treetoPolish(s.right)
                // s.asm = this.polishToAsm(s.rightPolish)
                
                // s.asm.push('popmi1 0')
                // s.asm.push('mi1tomemspnegoffset '+s.left) // TODO:stack
                delete s.right
                return s.type=LineTypes.FUNC_CALL
            }
            if(s.text.indexOf('=')!=-1){
                s.left = s.text.split('=')[0].trim()
                s.right = this.parseExpression(s.text.split('=')[1].trim())
                s.rightPolish = this.treetoPolish(s.right)
                s.asm = this.polishToAsm(s.rightPolish)
                s.asm.push('popmi1 0')
                s.asm.push('mi1tomemspnegoffset '+s.left) // TODO:stack
                delete s.right
                return s.type=LineTypes.EQUATION
            }
        }
        this.lines.map(detectLineType)
    }
    checkBeginEndPairs(){
        // needn't fix for stack
        let begins=[];
        let count = 1;
        for (let i=0; i<this.lines.length; i++){
            if(this.lines[i].type.endsWith('_BEGIN')){
                this.lines[i].beginId = count;
                begins.push({type: this.lines[i].type, id:count})
                count++;
            }
            if(this.lines[i].type=='END'){
                let {type,id} = begins.pop()
                this.lines[i].beginType = type;
                this.lines[i].beginId = id;
                // console.log(s)
                if(type=='IF_BEGIN')
                    this.lines[i].asm=['if_'+'ii'+'_end:nop']
                else if(type=='WHILE_BEGIN')
                    this.lines[i].asm=['jmp while_'+id+'_begin','while_'+id+'_end:nop']
            }

        }
        if(begins.length) throw new Error("END expected")
    }
    insertAddressesToCode(){
        // needn't fix for stack
        let fullAsm = this.fullAsm()
        for(let i=0; i<fullAsm.length;i++){
            // not working for labeled lines
            let cmd = fullAsm[i].split(' ')[0]
            // console.log(cmd)

            // if()

            // absolute mem
            if((cmd.startsWith('memto') || cmd.endsWith('tomem')) && (cmd!='memtosp')){ // TODO:stack
                let varName = fullAsm[i].split(' ')[1]
                let varInfo = this.variables.filter(i=>i.name==varName)
                fullAsm[i]=cmd+' '+varInfo[0].dataMemAddr
            }

            // relative stack mem
            if(cmd.startsWith('memspnegoffsetto') || cmd.endsWith('tomemspnegoffset')){ // TODO:stack
                let varName = fullAsm[i].split(' ')[1]
                let varInfo = this.variables.filter(i=>i.name==varName)
                fullAsm[i]=cmd+' '+(varInfo[0]?.negStOffset ??varName) // TODO: CHECK
                // console.log("->",fullAsm[i])
            }
            else{
                // console.log('not for me')
            }
        }
        return fullAsm
    }
    insertAddressesToFuncs(){
        let currentAddressSpace={}
        for(let i of this.lines){
            if(i.type==LineTypes.FUNC_BEGIN){
                console.log('found function')
                console.log(i.availableMemory)
                currentAddressSpace = i.availableMemory
                // while(true){}
            }
            if(i.isInsideFunc){
                console.log(i)
                if(i.asm){
                    console.log('found parseable string',i)
                    for(let num =0; num< i.asm.length; num++){
                        console.log('line')
                        let cmd = i.asm[num].split(' ')[0]
                        if(cmd.startsWith('memspnegoffsetto') || cmd.endsWith('tomemspnegoffset')){ // TODO:stack
                            let varName = i.asm[num].split(' ')[1]
                            let varInfo = currentAddressSpace.filter(i=>i.name==varName)
                            i.asm[num]=cmd+' '+(varInfo[0]?.negOffset ??'func!)')+'#atd'
                            // console.log("->",fullAsm[i])
                        }
                    }
                    console.log('computed',i)
                    // if(i.type!='FUNC_BEGIN')while(true){}
                }
            }
        }
    }
    insertBeginNumbers(){
        // needn't fix for stack
        console.log('lines:',this.lines)
        for(let i=0; i< this.lines.length; i++){
            if(this.lines[i].beginId){
                for(let j=0; j<this.lines[i]?.asm?.length??0; j++){
                    this.lines[i].asm[j] = this.lines[i].asm[j].replace('_ii_','_'+this.lines[i].beginId+'_')
                }
            }
        }
    }
}



// не работает проверка типа end, не проверяется 
// не работает умножение
let c = new HLCompiler()
c.setCode(`# variable initialization
var begin   
    x, y, i, z, t, v, k, p: unsigned
end


func sum ( a, b: unsigned ) begin
    var begin 
        t: unsigned
    end

    t = a + b

    return t
end


func sub ( a, b: unsigned ) begin
    var begin 
        t: unsigned
    end

    t = a - b

    return t
end

func min ( a, b: unsigned ) begin
    var begin 
        t: unsigned
    end

    t = b
    if a < b begin
        t = a
    end
    
    return t
end

func min3( a, b, c: unsigned ) begin
    var begin
        res: unsigned
    end
    
    res = min(a, b)
    res = min(res, c)

    return res
end

func max ( a, b: unsigned ) begin
    var begin 
        t: unsigned
    end

    t = b
    if a > b begin
        t = a
    end
    
    return t
end


entry begin

    x = 9
    y = 70
    i = 20

    z = min(x,y)
    t = max(x,y)
    v = sum(x,y)
    k = sub(x, y)
    p = min3(x,y,i)
    #    z = sub(x,y)
    #
    #    t = 4
    #
    #    x = sum(t,z)

end`)


import { format } from 'util';
import { setFlagsFromString } from 'v8';
import LLCompiler from './compiler.js'
import Device from './index.js'

const testFlags = {
    asm:1,
    hex:1,
    exec:1
}

c.clearEmptyLines()
console.log(c.textLines);
console.log(c.lines);
c.parseLineTypes();
console.log(c.lines);
c.computeVarSection();
c.parseFunctions()
c.funcLocalMalloc();
c.checkBeginEndPairs();
c.localVarOffset()
c.funcBeginAsm()
c.funcEndAsm()
console.log(JSON.stringify(c.lines.map(i=>({text:i.text, asm:i.asm, ...i})),null,1))
console.log(c.variables)
c.globalMalloc()
console.log(c.fullAsm())
console.log('asdfa')
console.log("FULL ASM: ")
console.log('+++++++++++++++++++++++++++++++++++++')
c.insertBeginNumbers();
c.insertAddressesToFuncs()
console.log(c.insertAddressesToCode().join('\n'))
// while(1){}
// console.log(c.insertAddressesToCode())
// console.log('\n\n+++++++++++++++++++++++++++++++++++++')
// console.log("FULL ASM: ")
// console.log('+++++++++++++++++++++++++++++++++++++')
// console.log(c.insertAddressesToCode().join('\n'))
// console.log('\n\n+++++++++++++++++++++++++++++++++++++')
// console.log("FULL BYTE CODE: ")
// console.log('+++++++++++++++++++++++++++++++++++++')

let c1 = new LLCompiler()
c1.parse(c.insertAddressesToCode().join('\n'))

console.log(c1.getProgmemByteString())
// console.log('\n\n+++++++++++++++++++++++++++++++++++++')
// console.log("EXECUTION RESULT: ")
// console.log('+++++++++++++++++++++++++++++++++++++')
let d = new Device()
d.progmem=eval(c1.getProgmemByteString())
// console.log(c1.getProgmemDump().length)


// // do not sythesize
// function runTicks(count){
//     for(let i=0; i<count; i++){
//         d.tick();
//     }
// }

function run(){
    while (d.cmdAddr<c1.getProgmemDump().length){
        console.log('tick')
        d.tick();
        console.log('mi1: ', d.mi1,'\tmi2:',d.mi2,'\tra',d.ra,'\tsp:', d.sp)
        // console.log('mi2: ',d.mi2)
        // console.log('ra:', d.ra)
        // console.log('sp:', d.sp)
        console.log('mem:', d.datamem.filter((i,num)=>num<27))
    }
}

// // runTicks(200)
if(testFlags.exec){
    run()
    console.log('mi1: ', d.mi1)
    console.log('mi2: ',d.mi2)
    console.log('mem:', d.datamem.filter((i,num)=>num<27))
    console.log('ra:', d.ra)
}
// // import Device from ".";

console.log('end')