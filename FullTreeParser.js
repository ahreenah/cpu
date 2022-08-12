
const TOKEN_TYPES =  {
    SIGN : ['+','-','*','/','>','<','==','!=',':',',','=',],
    KEYWORD : ['if','while','else','func','var', 'return'],
    BRACKET:  ['[',']','{','}','(',')','begin','end',],
    SEPARATOR:[',',';',],
    UNARY_OPERATOR:['&','$','!']
}

class Node{

}

class CodeTree{

}

class Token{

}

class FullTreeParser{
    tokens=[]
    typedTokens=[]
    constructor(code){
        let lines = code.split('\n');
        this.fullStr = lines.join(' ')
    }
    tokenize(){       
        for(let i of [...TOKEN_TYPES.SIGN, ...TOKEN_TYPES.BRACKET,...TOKEN_TYPES.SEPARATOR, ...TOKEN_TYPES.UNARY_OPERATOR])
            this.fullStr = this.fullStr.replaceAll(i,' '+i+' ')
        this.fullStr = this.fullStr.replaceAll(/ +/g,' ')
        this.tokens=this.fullStr.split(' ').filter(i=>i)
    }
    tokenTypes(){ 
        function detectTokenType(token){ 
            for(let type in TOKEN_TYPES ){
                if(TOKEN_TYPES[type].indexOf(token)!=-1){
                    return type
                }
            }
            if(parseInt(token)>=0)
                return "INT"
            return 'NAME'
        }
        this.typedTokens = this.tokens.map(i=>({text:i, type:detectTokenType(i)}))
    }
    computeLevels(){ 
        let level=0
        this.leveledTokens = []
        let bracketPath=[]
        for(let token of this.typedTokens){
            if(token.type!='BRACKET'){
                this.leveledTokens.push({...token, level, bracketPath:[...bracketPath]})
            }
            else{

                if(['[','(','{','begin'].indexOf(token.text)!=-1){
                    level++;
                    bracketPath.push(token.text)
                }
                else{
                    bracketPath.pop()
                    level--
                }
            }
        }
    }
    lastLevelOnly(){
        this.lastLevelTokens = this.leveledTokens.map(i=>({...i, lastLevelType:i.bracketPath.pop()}))
    }
    levelGroups(){
        let res=[];
        let partGroup=[]
        let level=0;
        let type=''
        for(let k of this.lastLevelTokens){
            if((k.level!=level) || (k.lastLevelType!=type)){
                res.push(partGroup)
                partGroup=[]
            }
            partGroup.push(k)
            delete k.bracketPath
            level=k.level
            type=k.lastLevelType
        }
        res.push(partGroup)
        for(let i in res){
            res[i]={
                level:res[i]?.[0]?.level,
                leveltype:res[i]?.[0]?.lastLevelType,
                children:res[i]
            }
            if(res[i].children?.[0])
            for (let k of res[i].children){
                delete k.level;

                delete k.lastLevelType
            }
        }
        res = res.filter((i,num)=>num>0)
    }
    levelize(){
        function levelizeOnce(arr){
            let maxLevel = -1
            for(let k of arr)
                if(k.level>maxLevel)
                    maxLevel=k.level
            let res= []
            let part = []
            for(let i of arr)
                if(i.level==maxLevel)
                    part.push(i)
                else{
                    if(part.length){
                        res[res.length-1].children=part
                        part=[]
                    }{
                        res.push(i)
                    }
                }
            if(part.length){
                res[res.length-1].children=part
            }
            return res
        }
        let t = [...this.lastLevelTokens]
        function isSameLevel(arr){
            for(let k  of arr){
                if(k.level!=arr[0].level)
                    return false
            }
            return true
        }
        while(!isSameLevel(t) && t.length!=1){
            t = levelizeOnce(t)
        }
        return t
    }

}

function groupBy(arr, field, recursive){
    let name = arr.text
    arr = arr.children
    let res = []
    let group = []
    let lastGroup = null
    for (let i of arr){
        if(i[field]!=lastGroup){
            if(group.length){
                res.push({type:group[0][field],lastLevelType:group[0][field],children:group,text:group[0][field]})
                group=[]
            }
            group=[i]
        }else{
            group.push(i)
        }
        lastGroup = i[field]
    }
    if(group.length)res.push({type:group[0][field],lastLevelType:group[0][field],children:group,text:group[0][field]})
    
    for(let k = 0 ; k< res[1].children.length; k++){
        if(res[1].children[k].text=='if' || res[1].children[k].text=='while'|| res[1].children[k].text=='func'|| res[1].children[k].text== 'module')
        res[1].children[k]=groupBy(res[1].children[k],field,false)
    }
    return {text:name,children:res}
}


let parsed = []

function multiplyNest(d){
    let arra = d
    let size = d.children.length
    for(let i=0; i<size; i++){
        if(d.children[i]?.children){
            d.children[i] = multiplyNest(d.children[i])
        }
        if(d.children[i]?.text=='*'){
                if(parsed.indexOf(d.children[i])==-1){
                    if(d.children[i].children){
                        d.children[i].children?.push({text:'right', children:[
                            ...d.children[i].children.filter(i=>i.text!='left')
                        ]})
                        d = arra
                        d.children[i].children?.push({text:'left', children:[
                            {...d.children[i-1],text:d.children[i-1].text}
                        ]})
                        d.children[i-1]={text:'removed'}

                        d.children=d.children.filter(k=>k.text!='removed')
                        i--
                        size = d.children.length
                    } else {
                        d.children[i].children=[{text:'left', children:[
                            d.children[i-1]
                        ]}]
                        d.children[i-1]={type:'removed'}
                        d.children[i].children.push({text:'right', children:[
                            d.children[i+1]
                        ]})
                        d.children[i+1]={type:'removed'}
                        d.children=d.children.filter(i=>i.type!='removed')
                        i--
                        size = d.children.length
                    }
                }
                parsed.push(d.children[i])
                d.children[i].children = d.children[i]?.children?.filter(i=>((i.text==='left') || (i.text==='right')))
        }
    }
    d.children = d.children.filter(i=>i)
    return d;
}

function mathTreeTestedInConsole(arr){
    for(let signs of[['&'],['$']]){
        let center = arr.indexOf(arr.find(i=>((signs.indexOf(i.text)!=-1) && (!i.computed))))
        let hasChildren = arr[center]?.children?.length
        if(center!=-1){
            if(!hasChildren)
                arr[center]={
                    text:arr[center].text,
                    computed:true,
                    children:[
                        {text:'right',children:[arr[center+1]]},
                    ]
                }
            else
                arr[center]={
                    text:arr[center].text,
                    computed:true,
                    children:[
                        {text:'right',children:mathTreeTestedInConsole(arr[center].children)},
                    ]
                }
            if(!hasChildren)
                arr.splice(center+1,1)
            if(arr.length>1)
                arr = mathTreeTestedInConsole(arr)
        }
    }
    for(let signs of[['*','/'],['+','-'],['<','>'],['='],[',',';'],[':']]){
        let center = arr.indexOf(arr.find(i=>((signs.indexOf(i.text)!=-1) && (!i.computed))))
        let hasChildren = arr[center]?.children?.length
        if(center!=-1){
            if(!hasChildren)
                arr[center]={
                    text:arr[center].text,
                    computed:true,
                    children:[
                        {text:'left',children:[arr[center-1]]},
                        {text:'right',children:[arr[center+1]]},
                    ]
                }
            else
                arr[center]={
                    text:arr[center].text,
                    computed:true,
                    children:[
                        {text:'left',children:[arr[center-1]]},
                        {text:'right',children:mathTreeTestedInConsole(arr[center].children)},
                    ]
                }
            if(!hasChildren)
                arr.splice(center+1,1)
            arr.splice(center-1,1)
            if(arr.length>1)
                arr = mathTreeTestedInConsole(arr)
        }
    }
    return arr
    
}


function printConsoleTree(v,level=0){
    const PAD = 3
    const PAD_SYMBOL = ' '
    const PAD_SYMBOL_LAST = '-'
    let start=''
    for(let i =0; i<level-1; i++)
        start+='|'+(PAD_SYMBOL.repeat(PAD))
    if(level)
    start+='|'+(PAD_SYMBOL_LAST.repeat(PAD))
    console.log(start+v.text+'  :  ' + v.lastLevelType)
    for(let i of v?.children??[]){
        printConsoleTree(i, level+1)
    }
}



function hasNotParsedMath(tree){
    if(!tree) return false
    if(tree.length==1) return false
    for(let k of tree){
        if(['+','-','*','/','>','<','='].indexOf(k.text)){
            if(!(k.children?.length))
                return true
            if((k?.children?.length==1) && (k.text=='*'))
                return true
        }
    }
    return false
}


function hasNotParsedMathDeep(tree){
    if(!tree){
        return false
    }
    if(hasNotParsedMath(tree))
        return true
    for(let k of tree)
        if(hasNotParsedMathDeep(k.children))
            return true
    return false
}

function findNotParsedMath(tree,){
    if(hasNotParsedMath(tree.children))
        return []

    for(let i=0; i<tree.children.length; i++){
        if(hasNotParsedMathDeep(tree.children[i]?.children)){
            return [i,...findNotParsedMath(tree.children[i])]
        }
    }
}

function getByPath(path,data){
    let t = data
    for(let i of path){
        t = t.children[i]
    }
    return t
}

function setByPath(obj,path,data){
    if(path.length==0)
        obj.children = data.children
    let p = obj;
    for(let i of path)
        p = obj.children[i]
    p.children=data.children

}



function codeToTree(code){

    let ftp = new FullTreeParser(code)

    ftp.tokenize()
    ftp.tokenTypes()
    ftp.computeLevels()
    ftp.lastLevelOnly()
    let d = ftp.levelize()[0]
    let ko = groupBy(d,'lastLevelType',true).children[1];
    
    let testAfterBraces = ko
    
    let oneMore = true;
    
    let was = null
    while(true){
    
        let addr = findNotParsedMath(ko)
        
        if(addr){
            let dt = getByPath(addr,ko)
            dt.children = mathTreeTestedInConsole(dt.children)
        }
        else{
            break
        }
    }
    return ko
}//($(&arr+i))>$(&arr+j)
printConsoleTree(codeToTree(`
        module (main) begin

        var begin
            i, j, t: unsigned
            arr: unsigned[5]
        end

            i = 0
            while (i < 5) begin 
                j = i
                while (j < 5) begin
                    if( $(&arr+i) > $(&arr+j) ) begin
                        t = $(&arr+i)
                        $(&arr+i) = $(&arr+j)
                        $(&arr+j) = t
                    end
                    j=j+1
                end
                i=i+1
            end
            $ x = x + &y 

        end
    `))