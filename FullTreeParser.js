/*

Full tree parser is used to generate syntax tree from provided text code.
It computed operation order and does the decomposition to simple actions

*/


const TOKEN_TYPES =  {
    STR:['\"'],
    SIGN : ['+','-','*','/','>','<','==','!=',':',',','=','.'],
    KEYWORD : ['if','while','else','func','var', 'return'],
    BRACKET:  ['[',']','{','}','(',')','begin','end',],
    SEPARATOR:[',',';',],
    UNARY_OPERATOR:['@','$','!','\'','return']
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
        lines = lines.map(i=>i.split('#')[0].trim())
        this.fullStr = lines.join(' ')
    }
    tokenize(){
        let stringsAndNotStrings = this.fullStr.split('"')
        console.log(stringsAndNotStrings)
        // let tokenizeOne=()=>{
        //     for(let i of [...TOKEN_TYPES.STR,...TOKEN_TYPES.SIGN, ...TOKEN_TYPES.BRACKET,...TOKEN_TYPES.SEPARATOR, ...TOKEN_TYPES.UNARY_OPERATOR])
        //         this.fullStr = this.fullStr.replaceAll(i,' '+i+' ')
        //     this.fullStr = this.fullStr.replaceAll(/ +/g,' ')
        //     this.tokens=this.fullStr.split(' ').filter(i=>i)
        //     for(let i = 0; i<this.tokens.length; i++){
        //         for(let k of ['!','>','<','='])
        //             if((this.tokens[i]==k) && (this.tokens[i+1]=='=')){
        //                 this.tokens[i]=k+'='
        //                 this.tokens[i+1]=''
        //             }
        //     }
        //     this.tokens = this.tokens.filter(i=>i)
        // }
        let tokenizeOne=(s)=>{
            for(let i of [...TOKEN_TYPES.STR,...TOKEN_TYPES.SIGN, ...TOKEN_TYPES.BRACKET,...TOKEN_TYPES.SEPARATOR, ...TOKEN_TYPES.UNARY_OPERATOR])
                s = s.replaceAll(i,' '+i+' ')
            s = s.replaceAll(/ +/g,' ')
            let tokens=s.split(' ').filter(i=>i)
            for(let i = 0; i<tokens.length; i++){
                for(let k of ['!','>','<','='])
                    if((tokens[i]==k) && (tokens[i+1]=='=')){
                        tokens[i]=k+'='
                        tokens[i+1]=''
                    }
            }
            tokens = tokens.filter(i=>i)
            return tokens
        }
        let res = []
        for(let i = 0; i<stringsAndNotStrings.length; i++){
            if(i%2==0){
                let tokensOne = tokenizeOne(stringsAndNotStrings[i])
                for(let token of tokensOne)
                    res.push(token)
            }else{
                res.push('"'+stringsAndNotStrings[i]+'"')
            }
        }
        console.log(res);
        this.tokens = res;

        // tokenizeOne();
        // console.log(this.tokens)
        // while(1){}       
        // this.findStrs()
    }
    // findStrs(){
    //     let isInStr = false
    //     let lastToken = ''
    //     let res = []
    //     for(let i of this.tokens){
    //         if(!isInStr){
    //             if(i=='"'){
    //                 isInStr = true;
    //                 lastToken=''
    //                 continue
    //             }
    //             res.push(i)
    //         }else{
    //             if(i=='"'){
    //                 isInStr = false;
    //                 res.push('"'+lastToken.substr(0,lastToken.length-1)+'"')
    //                 console.log('end str:'+lastToken)
    //                 continue
    //             }
    //             lastToken+=i+' '
    //         }
    //     }
    //     console.log(res)
    //     this.tokens = res;
    // }
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
        this.lastLevelTokens = this.leveledTokens.map(i=>({...i, lastLevelType:i.bracketPath[i.bracketPath.length-1]}))
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
    if(res[2]){
        for(let k = 0 ; k< res[2].children.length; k++){
            if(res[2].children[k].text=='if' || res[2].children[k].text=='while'|| res[2].children[k].text=='func'|| res[2].children[k].text== 'module')
                res[2].children[k]=groupBy(res[2].children[k],field,false)
        }
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
    for(let signs of[['@'],['$'],['!'],['\'']]){
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
    for(let signs of[['.'],['*','/'],['+','-'],['<','>','==','!=','>=','<='],['='],[',',';'],[':']]){
        let center = arr.indexOf(arr.find(i=>((signs.indexOf(i.text)!=-1) && (!i.computed))))
        let hasChildren = arr[center]?.children?.length
        if(center!=-1){
            if(!hasChildren)
                arr[center]={
                    text:arr[center].text,
                    computed:true,
                    lastLevelType:arr[center].lastLevelType,
                    children:[
                        {text:'left',children:[{...arr[center-1],lastLevelType:undefined}]},
                        {text:'right',children:[{...arr[center+1],lastLevelType:undefined}]},
                    ]
                }
            else
                arr[center]={
                    text:arr[center].text,
                    computed:true,
                    lastLevelType:arr[center].lastLevelType,
                    children:[
                        {text:'left',children:[{...arr[center-1],lastLevelType:undefined}]},
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


export function printConsoleTree(v,level=0){
    const PAD = 3
    const PAD_SYMBOL = ' '
    const PAD_SYMBOL_LAST = '-'
    let start=''
    for(let i =0; i<level-1; i++)
        start+='|'+(PAD_SYMBOL.repeat(PAD))
    if(level)
    start+='|'+(PAD_SYMBOL_LAST.repeat(PAD))
    console.log(start+v.text+'  :  ' + v.lastLevelType)// + ' ' + JSON.stringify({...v,children:null}))
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



function fixUnaryOperators(tree){
    let text = tree.text
    tree = tree.children
    // console.log('here 1'); while(1){}
    if(!tree)
        return null

    for(let i = 0; i < tree.length; i++){
        if(tree[i]?.text=='return'){
            // console.log(tree[i])
            // console.log(tree[i]?.children?.[0]?.lastLevelType)
            console.log('found return')
            // while(1){}
            if(!tree[i].children){
                tree[i]={
                    text:'return',
                    children:[
                            tree[i+1]
                    ]
                }
                tree[i+1] = null
            }
        }
        else if(tree[i]?.children && tree[i]?.text!='var'){
            // console.log(tree[i]);
            // while(1){}
            tree[i] = fixUnaryOperators(tree[i])
        }
    }
    tree = tree.filter(i=>i)
    console.log(tree)
    return {children:tree, text}
}


function fixFuncs(tree){
    for(let i = 0; i<tree.children.length-1; i++){
        console.log(tree.children[i].text)
        if(tree.children[i].text=='func'){
            console.log('func!')
            printConsoleTree(tree.children[i])
            let nextChildren = tree.children[i+1].children
            console.log(nextChildren)
            nextChildren = (groupBy({children:nextChildren},'lastLevelType'))
            console.log(nextChildren.children) // [0] -> args, [1] -> body
            // delete tree.children[i+1].children
            // tree.children[i+1].lastLevelType='('
            tree.children[i].children=[{text:tree.children[i+1].text,lastLevelType:'name',children:[]},...nextChildren.children]//[
                console.log(tree.children[i])
                // while(1){}
            //     tree.children[i+1],
            //     ...nextChildren
            // ]
            // tree.children[i].children[1].lastLevelType='{'
            tree.children[i].children[1] = {
                lastLevelType:'args',
                text:',',
                children:tree.children[i].children[1].children
            }//tree.children[i].children[1].children[0].children[0]
            // tree.children[i].children[1].children=[tree.children[i].children[1].children[0].children[0]]
            // tree.children[i].text=
            // tree.children[i].children[2].children = tree.children[i].children[2].children
            for(let j = i+1; j<tree.children.length-1; j++)
                tree.children[j] = tree.children[j+1]
            tree.children.pop()
            // while(1){}
        }
    }
    return tree
}

let cttcount = 0


function deleteTopItemInArgs(tree){
    let res = []
    for(let i of tree.children){
        if(i.text=='func'){
            i.children[1].children = i.children[1].children[0].children
            console.log('found func')
            printConsoleTree(i)
            res.push(i)
            // while(1){}
        }else{
            res.push(i)
        }
    }
    return {text:tree.text,children:res}
}

function fixFuncBegins(tree){
    
    let res = []
    for(let i of tree.children){
        if(i.text=='func'){
            i.children[2].children = i.children[2].children[0].children
            console.log('found func')
            // printConsoleTree(i)
            res.push(i)
            // while(1){}
        }else{
            res.push(i)
        }
    }
    return {text:tree.text,children:res}
}




function fixStructs(tree){
    for(let i=0; i<tree.children.length; i++){
        if(tree.children[i].text=='class'){
            let hasExtend = tree?.children?.[i+2]?.text =='is'
            tree.children[i].children=[
                {
                    text:'name',
                    children:[
                        // {
                            // text:
                            {text:tree.children[i+1].text}
                        // }
                    ]
                },
                {
                    text:'fields',
                    children:hasExtend?tree.children[i+3].children:tree.children[i+1].children
                }
            ]
            if(hasExtend){
                tree.children[i].children.push({
                    text:'extend',
                    children:[
                        {
                            text: tree.children[i+3].text
                        }
                    ]
                })
                
                for(let j = i+1; j<tree.children.length-1; j++){
                    tree.children[j] = tree.children[j+1]
                }
                tree.children.pop()
                
                for(let j = i+1; j<tree.children.length-1; j++){
                    tree.children[j] = tree.children[j+1]
                }
                tree.children.pop()
            }
            for(let j = i+1; j<tree.children.length-1; j++){
                tree.children[j] = tree.children[j+1]
            }
            tree.children.pop()

        }
    }
    return tree
}

export function codeToTree(code){

    let ftp = new FullTreeParser(code)

    ftp.tokenize()
    console.log(ftp.tokens)

    ftp.tokenTypes()
    ftp.computeLevels()
    ftp.lastLevelOnly()
    // console.log(ftp.lastLevelTokens)
    let d = ftp.levelize()[0]
    d = fixFuncs(d);
    console.log(d)
    let ko = groupBy(d,'lastLevelType',true).children[1];
    let testAfterBraces = ko
    
    let oneMore = true;

    let was = null
    ko = fixUnaryOperators(ko)
    console.log('before deleteTopItemInArgs')
    printConsoleTree(ko)
    ko = deleteTopItemInArgs(ko)
    console.log('after deleteTopItemInArgs')
    ko = fixStructs(ko)
    printConsoleTree(ko)
    while(true){
        console.log('in ctt')
        
        cttcount++

        if(cttcount>100) break
        // while(1){}
        let addr = findNotParsedMath(ko)
        
        if(addr){
            let dt = getByPath(addr,ko)
            dt.children = mathTreeTestedInConsole(dt.children)
        }
        else{
            break
        }
        
    }
    ko = fixFuncBegins(ko)
    printConsoleTree(ko)
    // while(1){}
    return ko
}//($(&arr+i))>$(&arr+j)
printConsoleTree(codeToTree(`


module (main) begin

    
    class person (
        name: int(20)
        aghe: int
    )

    class person2 (
        name: int(20)
        aghe: int
    )

    class human is person2 (
        name: int(20)
        aghe: int
    )

    

    var begin
        a, b, c,d,e: int
        ar:int(150)
        br:int(150)
        eneds:int(20)
        hum:human
    end




    func streqr (x) begin
        var begin
            i:int
        end
        i =0
        return i
    end

    func streq (x2, u) begin
        var begin
            i:int
        end
        i =0
        return i
    end

    
    hum.age.size.(3) = 22

end
`))