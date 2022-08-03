const TOKEN_TYPES =  {
    SIGN : ['+','-','>','<','==','!=',':',',','=',],
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
        console.log(JSON.stringify(res,null,2))
    }
    levelize(){
        function levelizeOnce(){

        }
    }
}

let ftp = new FullTreeParser(`
    func main() begin
        var begin
            x: unsigned
        end
        x = 0;
        if (x>10) begin
            x = 10 * (2+2);
        end
        x = 0
    end
`)

ftp.tokenize()
console.log(ftp.tokens)
ftp.tokenTypes()
console.log(ftp.typedTokens)
ftp.computeLevels()
ftp.lastLevelOnly()
console.log(ftp.lastLevelTokens)
ftp.levelGroups()