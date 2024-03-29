const LineTypes= {
    VAR_BEGIN:"VAR_BEGIN",
    ENTRY_BEGIN:"ENTRY_BEGIN",
    IF_BEGIN:"IF_BEGIN",
    WHILE_BEGIN:"WHILE_BEGIN",
    COMMAND:"COMMAND",
    EQUATION:"EQUATION",
    TYPE_DEFINITION:"TYPE_DEFINITION",
    END:"END",
}

const VAR_START_ADDR=21

class HLCompiler{
    code='';
    textLines=[];
    lines = [];
    variables=[];
    beginCount=0;
    setCode(v){
        this.code=v
        this.textLines = this.code.split('\n')
    }
    clearEmptyLines(){
        this.textLines = this.textLines.map(i=>i.split('#')[0].trim()).filter(i=>i?.length)
        const signs = ['+','-','>','<','==','!=','(',')','[',']',':',',']
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
        this.variables=data;
    }
    polishToAsm(v){
        let res = [];
        const STACK_ADDR=0
        for(let i of v){
            if(i.type=='VALUE'){
                let isNumber = !isNaN(+i.value)
                if(isNumber){
                    res.push('ctomi1 '+i.value)
                }
                else{
                    res.push('memtomi1 '+i.value) // TODO:stack sbacktomi1 
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
                res.push('pushmi1 ' + STACK_ADDR)
            }
        }
        return res;
    }
    fullAsm(){
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
        let  detectLineType=(s)=>{
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
                    s.condasm = this.polishToAsm(s.condPolish)
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
            if(s.text.indexOf('=')!=-1){
                s.left = s.text.split('=')[0].trim()
                s.right = this.parseExpression(s.text.split('=')[1].trim())
                s.rightPolish = this.treetoPolish(s.right)
                s.asm = this.polishToAsm(s.rightPolish)
                s.asm.push('popmi1 0')
                s.asm.push('mi1tomem '+s.left) // TODO:stack
                delete s.right
                return s.type=LineTypes.EQUATION
            }
        }
        this.lines.map(i=>({...i,type:detectLineType(i)}))
    }
    checkBeginEndPairs(){
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
        let fullAsm = this.fullAsm()
        for(let i=0; i<fullAsm.length;i++){
            // not working for labeled lines
            let cmd = fullAsm[i].split(' ')[0]
            if(cmd.startsWith('memto') || cmd.endsWith('tomem')){ // TODO:stack
                let varName = fullAsm[i].split(' ')[1]
                let varInfo = this.variables.filter(i=>i.name==varName)
                fullAsm[i]=cmd+' '+varInfo[0].dataMemAddr
            }
        }
        return fullAsm
    }
    insertBeginNumbers(){
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
    x, y, z : unsigned
end

entry begin
    x = 1
    y = 3
    

    while x > y begin
        z = z + 1
        x = x - y
    end
    
    if x = 1 begin
        while y < 11 begin
            y = y + 2
            if y = 2 begin
                x=55
            end
        end
    end

end`)


import LLCompiler from './compiler.js'
import Device from './index.js'

c.clearEmptyLines()
console.log(c.textLines);
console.log(c.lines);
c.parseLineTypes();
c.checkBeginEndPairs();
console.log(JSON.stringify(c.lines.map(i=>({text:i.text, asm:i.asm, ...i})),null,1))
c.computeVarSection();
console.log(c.variables)
console.log(c.fullAsm())
console.log(c.insertAddressesToCode())
console.log('\n\n+++++++++++++++++++++++++++++++++++++')
console.log("FULL ASM: ")
console.log('+++++++++++++++++++++++++++++++++++++')
c.insertBeginNumbers();
console.log(c.insertAddressesToCode().join('\n'))
console.log('\n\n+++++++++++++++++++++++++++++++++++++')
console.log("FULL BYTE CODE: ")
console.log('+++++++++++++++++++++++++++++++++++++')
let c1 = new LLCompiler()
c1.parse(c.insertAddressesToCode().join('\n'))
console.log(c1.getProgmemByteString())
console.log('\n\n+++++++++++++++++++++++++++++++++++++')
console.log("EXECUTION RESULT: ")
console.log('+++++++++++++++++++++++++++++++++++++')
let d = new Device()
d.progmem=eval(c1.getProgmemByteString())
console.log(c1.getProgmemDump().length)


// do not sythesize
function runTicks(count){
    for(let i=0; i<count; i++){
        d.tick();
    }
}

function run(){
    while (d.cmdAddr<c1.getProgmemDump().length){

        d.tick();
    }
}

// runTicks(200)
run()
console.log('mi1: ', d.mi1)
console.log('mi2: ',d.mi2)
console.log('mem:', d.datamem)
console.log('ra:', d.ra)
// import Device from ".";
