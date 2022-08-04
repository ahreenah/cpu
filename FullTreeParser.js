const TOKEN_TYPES =  {
    SIGN : ['+','-','*','/','>','<','==','!=',':',',','=',],
    KEYWORD : ['if','while','else','func','var', 'return'],
    BRACKET:  ['[',']','{','}','(',')','begin','end',],
    SEPARATOR:[',',';',],
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
        for(let i of [...TOKEN_TYPES.SIGN, ...TOKEN_TYPES.BRACKET,...TOKEN_TYPES.SEPARATOR])
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
                console.log('no bracket',bracketPath)
                this.leveledTokens.push({...token, level, bracketPath:[...bracketPath]})
            }
            else{

                if(['[','(','{','begin'].indexOf(token.text)!=-1){
                    level++;
                    bracketPath.push(token.text)
                    console.log('set type:'+token.text)
                }
                else{
                    bracketPath.pop()
                    console.log('remove type')
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
        console.log(JSON.stringify(res,null,2))
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
            console.log('aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa')
            console.log(JSON.stringify(t))
            console.log('bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb')
        }
        return t
    }

}

function groupBy(arr, field){
    let name = arr.text
    arr = arr.children
    console.log('gby arr:',arr)
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
        console.log(lastGroup)
    }
    if(group.length)res.push({type:group[0][field],lastLevelType:group[0][field],children:group,text:group[0][field]})
    console.log('groupBy res: ',res)
    return {text:name,children:res}
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
    console.log(start+v.text+'  :  ' + v.lastLevelType)// +JSON.stringify(v))
    for(let i of v.children??[]){
        printConsoleTree(i, level+1)
    }
}
let ftp = new FullTreeParser(`
    func (main)() begin
        if(1>2*(x-1)) begin
            x = 10 * (2+2);
            y = 3
            if (x>8) begin
                y = 90
                x = y - x
            end
        end
        x = 0 * (2+2)
        x = 1
        fomeFunc(x,y)
        someFunc(1,x)
        someFunc(1,6)
        someFunc(2,someFunc(2,5))
        someFunc(2,2*(3+x))
    end
`)

ftp.tokenize()
console.log(ftp.tokens)
ftp.tokenTypes()
console.log(ftp.typedTokens)
ftp.computeLevels()
ftp.lastLevelOnly()
// console.log(ftp.lastLevelTokens)
// console.log(JSON.stringify(ftp.levelize(),null,2))
let d = ftp.levelize()[0].children[1]
console.log('d:',)
printConsoleTree(groupBy(d,'lastLevelType'))
// console.log(ftp.levelize()[0].children[1])
// ftp.levelGroups()