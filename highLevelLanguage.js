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

class HLCompiler{
    code='';
    textLines=[];
    lines = [];
    setCode(v){
        this.code=v
        this.textLines = this.code.split('\n')
    }
    clearEmptyLines(){
        this.textLines = this.textLines.map(i=>i.split('#')[0].trim())
        const signs = ['+','-','>','<','==','!=','(',')','[',']']
        signs.map(i=>
            this.textLines = this.textLines.map(s=>s=s.replaceAll(i,' '+i+' '))
        )
        this.textLines = this.textLines.filter(i=>i.length).map(i=>i.replaceAll(/\ +/g,' '))
        
        this.lines = this.textLines.map(i=>({text:i}))
    }
    parseTypeDefinition(v){
        let ar = v.text.split(':')
        ar[0]=ar[0].trim().split(',').map(i=>i.trim())
        console.log('ar[1]',JSON.stringify(ar[1]))
        console.log( 'groups:',ar[1].match(/(?<type>\w*) ?(\[(?<size>\d+)\])?/).groups)
        let {size, type} = ar[1].trim().match(/(?<type>\w*) ?(\[(?<size>\d+)\])?/).groups
        v.data={
            variableNames :ar[0],
            variable_type:type,
            size:size
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
        return {left:tree[0],right:tree[2],sign:tree[1].value, type:'EXPRESSION'}
    }

    /*
        x * 4 + y * 3 == 20

        {
            "left": {
                "type": "EXPRESSION",
                "left": {
                    "type": "EXPRESSION",
                    "left": {
                        "type": "VALUE",
                        "value": "x"
                    },
                    "sign": "*",
                    "right": {
                        "type": "VALUE",
                        "value": "4"
                    }
                },
                "sign": "+",
                "right": {
                    "type": "EXPRESSION",
                    "left": {
                        "type": "VALUE",
                        "value": "y"
                    },
                    "sign": "*",
                    "right": {
                        "type": "VALUE",
                        "value": "3"
                    }
                }
            },
            "right": {
                "type": "VALUE",
                "value": "20"
            },
            "sign": "==",
            "type": "EXPRESSION"
        }

        ==
            20
            +
                *
                    X
                    4
                *
                    Y
                    3
        
        x 4 * y 3 * + 20 ==
        
        push x
        push 4
        pop mi2
        pop mi1
        momultomi1 
        push mi1
        push y
        push 3
        pop mi2
        pop mi1
        momultomi1
        push mi1
        pop mi2
        pop mi1
        mosumtomi1
        push mi1
        push 20
        jmp.eq inside
        jmp end
        inside:
            // code
        end:


    */
    
    /*
        expression:

        x + y * 3 == 2

        tree:

        {
            "left": {
                "type": "EXPRESSION",
                "left": {
                    "type": "VALUE",
                    "value": "x"
                },
                "sign": "+",
                "right": {
                    "type": "EXPRESSION",
                    "left": {
                        "type": "VALUE",
                        "value": "y"
                    },
                    "sign": "*",
                    "right": {
                        "type": "VALUE",
                        "value": "3"
                    }
                }
            },
            "right": {
                "type": "VALUE",
                "value": "2"
            },
            "sign": "==",
            "type": "EXPRESSION"
        }

        x y 3 * + 2 ==

        push x
        push y
        push 3
        pop mi2
        pop mi1
        momultomi1
        push mi1
        pop mi2
        pop mi1
        mosumtomi1
        push mi1
        push 2
        pop mi2
        pop mi1
        jmp.eq inside
        jmp end
        inside;
        // code
        end:

    */
     
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
                    return s.type=LineTypes.WHILE_BEGIN
                }
                throw new Error("end is expected")
            }
            if(s.text.startsWith('if')){
                if(s.text.endsWith('begin')){
                    let cond = s.text.split('if ')[1].split(' begin')[0]
                    s.cond=this.parseExpression(cond)
                    return s.type=LineTypes.IF_BEGIN
                }
                throw new Error("end is expected")
            }
            if(s.text.indexOf(':')!=-1){
                this.parseTypeDefinition(s)
                return s.type=LineTypes.TYPE_DEFINITION
            } 
            if(s.text=='end')
                return s.type=LineTypes.END
            if(s.text.indexOf('=')!=-1){
                s.left = s.text.split('=')[0].trim()
                s.right = this.parseExpression(s.text.split('=')[1].trim())
                
                return s.type=LineTypes.EQUATION
            }
        }
        this.lines.map(i=>({...i,type:detectLineType(i)}))
    }
}

let c = new HLCompiler()
c.setCode(`# variable initialization
var begin   
    x, y, z : unsigned
    ar      : unsigned [10]
end

# alternative to int main (entry point)
entry begin
    x = 3
    y = 4
    
    if x * 4 + y * 3 == 20 begin
        z = x
        x = y
        y = z
    end

    z = y
    
    while y + 2 begin
        z = z + y
        x = x - 1
    end

end`)
c.clearEmptyLines()
console.log(c.textLines);
console.log(c.lines);
c.parseLineTypes();
console.log(JSON.stringify(c.lines,null,1))