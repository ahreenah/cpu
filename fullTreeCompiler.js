import {printConsoleTree, codeToTree} from './FullTreeParser.js'
let args = process.argv.slice(2)

function generateUID() {
    // I generate the UID from two parts here 
    // to ensure the random number provide enough bits.
    var firstPart = (Math.random() * 46656) | 0;
    var secondPart = (Math.random() * 46656) | 0;
    firstPart = ("000" + firstPart.toString(36)).slice(-3);
    secondPart = ("000" + secondPart.toString(36)).slice(-3);
    return firstPart + secondPart;
}

function getChildByText(tree, text){
    let res = tree.children.filter(i=>i.text==text)
    if(res.length>1)throw new Error(`More than one element with text "${text}"`)
    if(res.length==0) return null
    return res[0]
}

function arrayFromBin(tree,sign){
    console.log('called arrayfromtree for',tree)
    if(tree.text!=sign){
        console.log('found end element for ',sign)
        console.log(tree)
        return [tree]
    }
    let leftChild =  getChildByText(tree,'left').children[0]
    let rightChild = getChildByText(tree,'right').children[0]
    console.log('l:',leftChild)
    console.log('r',rightChild)
    if(leftChild.text==sign)
        leftChild = arrayFromBin(leftChild,',')
    else
        leftChild=[leftChild]
    if(rightChild.text==sign)
        rightChild = arrayFromBin(rightChild,',')
    else
        rightChild=[rightChild]
    return [...leftChild, ...rightChild] 
}

function parseVar(tree){
    let res = []
    for(let i of tree.children){
        if(i.text!=':')
            throw new Error(`Var line should contain exactly one ":" sign" `)
        let rightItem = getChildByText(i,'right');
        let leftItem = getChildByText(i,'left');
        let size = 1
        if(rightItem.children[0].children?.length)
            size = parseInt(rightItem.children[0].children[0].text)
        let type={
            type:rightItem.children[0].text,
            size,
            varNames:arrayFromBin(leftItem.children[0],',').map(i=>i.text)
        }
        res.push(type)
    }
    let varObj = {vars:[]}
    for(let i of res){
        for(let j of i.varNames){
            varObj.vars.push({name:j, size:i.size})
        }
    }
    let totalSize = 0
    for(let i = varObj.vars.length-1; i>=0; i--){
        totalSize+=varObj.vars[i].size
        varObj.vars[i].negOffset = totalSize
    }
    varObj.totalSize = totalSize
    return varObj
}

function mathToAsm(tree, context){
    if(!isNaN(parseInt(tree.text))){
        return [`ctomi1  ${tree.text}`, `pushmi1 0`]
    }
    if(tree.text=='+'){
        let leftAsm = mathToAsm(tree.children[0].children[0],context)
        let rightAsm = mathToAsm(tree.children[1].children[0],context)
        return [
            ...leftAsm, 
            ...rightAsm,
            'popmi2 0',
            'popmi1 0',
            'mosumtomi1',
            'pushmi1 0'
        ]
    }
    else if(tree.text=='-'){
        let leftAsm = mathToAsm(tree.children[0].children[0],context)
        let rightAsm = mathToAsm(tree.children[1].children[0],context)
        return [
            ...leftAsm, 
            ...rightAsm,
            'popmi2 0',
            'popmi1 0',
            'mosubtomi1',
            'pushmi1 0'
        ]
    }

    else if(tree.text=='*'){
        let leftAsm = mathToAsm(tree.children[0].children[0],context)
        let rightAsm = mathToAsm(tree.children[1].children[0],context)
        return [
            ...leftAsm, 
            ...rightAsm,
            'popmi2 0',
            'popmi1 0',
            'momultomi1',
            'pushmi1 0'
        ]
    }

    else if(tree.text=='>'){
        let leftAsm = mathToAsm(tree.children[0].children[0],context)
        let rightAsm = mathToAsm(tree.children[1].children[0],context)
        return [
            ...leftAsm, 
            ...rightAsm,
            'popmi2 0',
            'popmi1 0',
            //
            'ctora.gt 1',
            'ctora.lt.eq 0',
            'ratomi2',
            //
            'pushmi2 0'
        ]
    }

    else if(tree.text=='!='){
        let leftAsm = mathToAsm(tree.children[0].children[0],context)
        let rightAsm = mathToAsm(tree.children[1].children[0],context)
        return [
            ...leftAsm, 
            ...rightAsm,
            'popmi2 0',
            'popmi1 0',
            //
            'ctora.gt.lt 1',
            'ctora.eq 0',
            'ratomi2',
            //
            'pushmi2 0'
        ]
    }

    else if(tree.text=='<='){
        let leftAsm = mathToAsm(tree.children[0].children[0],context)
        let rightAsm = mathToAsm(tree.children[1].children[0],context)
        return [
            ...leftAsm, 
            ...rightAsm,
            'popmi2 0',
            'popmi1 0',
            //
            'ctora.eq.lt 1',
            'ctora.gt 0',
            'ratomi2',
            //
            'pushmi2 0'
        ]
    }

    else if(tree.text=='>='){
        let leftAsm = mathToAsm(tree.children[0].children[0],context)
        let rightAsm = mathToAsm(tree.children[1].children[0],context)
        return [
            ...leftAsm, 
            ...rightAsm,
            'popmi2 0',
            'popmi1 0',
            //
            'ctora.gt.eq 1',
            'ctora.lt 0',
            'ratomi2',
            //
            'pushmi2 0'
        ]
    }
    
    else if(tree.text=='<'){
        let leftAsm = mathToAsm(tree.children[0].children[0],context)
        let rightAsm = mathToAsm(tree.children[1].children[0],context)
        return [
            ...leftAsm, 
            ...rightAsm,
            'popmi2 0',
            'popmi1 0',
            //
            'ctora.lt 1',
            'ctora.gt.eq 0',
            'ratomi2',
            //
            'pushmi2 0'
        ]
    }

    else if(tree.text=='=='){
        let leftAsm = mathToAsm(tree.children[0].children[0],context)
        let rightAsm = mathToAsm(tree.children[1].children[0],context)
        return [
            ...leftAsm, 
            ...rightAsm,
            'popmi2 0',
            'popmi1 0',
            //
            'ctora.eq 1',
            'ctora.gt.lt 0',
            'ratomi2',
            //
            'pushmi2 0'
        ]
    }


    if(tree.text=='$'){
        // value by addres
        let leftAsm = mathToAsm(tree.children[0].children[0],context)
        return [
            ...leftAsm,
            'popmi1 0',
            'mi1tora',
            'memratomi2',
            // 'mosumtomi1',
            'pushmi2 0'
        ]
    }

    else if (tree.text=='@'){
        let right = getChildByText(tree,'right').children[0]
        let varName = right.text
        console.log(context[varName].negOffset)
        console.log(right)

        // while(1){}
        return [
            'pushsp 0',
            'popmi1 0',
            `ctomi2 ${context[varName].negOffset-1}`,
            'mosubtomi1',
            // // ...mathToAsm(right,context),
            // 'pushsp 0',
            // 'popmi1 0',
            // 'popmi2 0',
            // 'mosubtomi1',
            'pushmi1 0'
        ]
        while(1){}
        // let leftAsm = mathToAsm(tree.children[0].children[0],context)

    }


    else{
        if(context[tree.text])
        return [
            `memspnegoffsettomi1 ${context[tree.text].negOffset - 1}`,
            `pushmi1 0`
        ]
        else{
            throw new Error(`${tree.text} is not defined`)
        }
    }

    
}

function parseAssign(tree, context){
    // printConsoleTree(tree)
    let rightItem = getChildByText(tree,'right');
    let leftItem = getChildByText(tree,'left');
    printConsoleTree(leftItem)
    printConsoleTree(rightItem)
    return(mathToAsm(rightItem.children[0], context))
}

function compile(tree){
    console.log('got', tree)
    let globalVar = getChildByText(tree,'var')
    let parsedVar = parseVar(globalVar);
    console.log('s:',JSON.stringify(parsedVar))
    let globalVarObj = {}
    console.log('gv',globalVarObj)
    for (let i of parsedVar.vars){
        globalVarObj[i.name] = i
    }
    console.log('gvo',globalVarObj)
    globalVar = globalVarObj
    function compileLogicTree(tree, localContext, globalContextOffset,funcName) {
        console.log('tree',tree)
        let availableVars = globalVar
        let availableVarsObj = globalVarObj
        if(globalContextOffset){
            console.log('-------------------')
            console.log(localContext)
            console.log(globalContextOffset)
            let globalContextArr = Object.keys(globalVarObj).map(i=>globalVarObj[i])
            console.log()
            let totalVars = [...globalContextArr.map(i=>({
                name:i.name,
                size:i.size,
                negOffset:i.negOffset+globalContextOffset
            })),...localContext.map(i=>({
                ...i, 
                negOffset:i.negOffset+2
            }))]
            console.log('=======================')
            console.log(globalVar)
            console.log(globalVarObj)
            console.log(totalVars)
            availableVars = totalVars
            availableVarsObj = {}
            for(let k of availableVars) 
                availableVarsObj[k.name] = k
            
            // while(1){}
        }
        for(let i of tree.children){
            if(i.text=='='){
                let leftChild = getChildByText(i,'left').children[0]
                let leftName = leftChild.text
                let isPointer = false;
                let leftAsm=[]
                if(leftName=='$'){
                    isPointer = true;
                    leftName = 'XX'
                    // console.log(leftChild)
                    console.log(getChildByText(leftChild,'right').children[0]);
                    console.log('$ right asm',mathToAsm(getChildByText(leftChild,'right').children[0],availableVarsObj))
                    leftAsm = [
                        // push right value
                        'pushmi1 0',
                        // compute address
                        ...mathToAsm(getChildByText(leftChild,'right').children[0],availableVarsObj),
                        // get computed address
                        'popmi2 0',
                        // save address to ra
                        'mi2tora',
                        // restore computed value
                        'popmi1 0',
                        // save computde value to computed address
                        'mi1tomemra'
                    ];
                    // while(1){}
                }else{
                    leftAsm =  [`mi1tomemspnegoffset ${availableVarsObj[leftName].negOffset-1}`]
                }

                i.asm = [
                    ...parseAssign(i, availableVarsObj),
                    'popmi1 0',
                    ...leftAsm
                    // `mi1tomemspnegoffset ${isPointer?'xx':globalVar[leftName].negOffset-1}`
                ]
                console.log(i.asm)
                // console.log(globalVar[leftName],i.children[0])
            }
            else if(i.text=='var'){
                console.log(i)
                let parsedVar = parseVar(i);
                console.log('s:',JSON.stringify(parsedVar))
                let globalVarObj = {}
                console.log('gv',globalVarObj)
                console.log('gv',globalVarObj)
                for (let i of parsedVar.vars){
                    globalVarObj[i.name] = i
                }
                console.log('gvo',globalVarObj)
                // while(1){}
                i.asm=[
                    `malloc 0 ${globalVarObj[Object.keys(globalVarObj)[0]].negOffset}`,
                    `memtosp 0`
                ]
            }
            else if(i.text=='if'){
                console.log(i)
                // console.log(i)
                // console.log(getChildByText(i,'begin'))
                let bodyRes = []
                for (let k of compileLogicTree(getChildByText(i,'begin')).children.map(i=>i.asm)){
                    bodyRes = [...bodyRes, ...k]
                }
                console.log(getChildByText(i,'(').children[0])
                let condAsm  =mathToAsm(getChildByText(i,'(').children[0],availableVarsObj);
                console.log('mta',condAsm)
                // while(1){}
                let condRes = []
                for (let k of condAsm ){
                    console.log(k)
                    condRes = [...condRes, k]
                }

                let ifId = generateUID()
                console.log(bodyRes)
                
                i.asm = [
                    '# if begin',
                        ...condRes.map(i=> '   '+i),
                        '   popmi1 0',
                        '   ctomi2 0',
                        `   jmp.eq if_${ifId}_end`,
                        `   jmp if_${ifId}_inside`,
                    '# if body',
                        `   if_${ifId}_inside:nop`,
                        ...bodyRes.map(i=> '   '+i),
                    '# if epilog',
                        `   if_${ifId}_end:nop`,
                    '# if end'
                ]
                // while(1){}
            }
            else if(i.text=='while'){
                console.log(i)
                // console.log(i)
                // console.log(getChildByText(i,'begin'))
                let bodyRes = []
                for (let k of compileLogicTree(getChildByText(i,'begin')).children.map(i=>i.asm)){
                    bodyRes = [...bodyRes, ...k]
                }
                console.log(getChildByText(i,'(').children[0])
                let condAsm  =mathToAsm(getChildByText(i,'(').children[0],availableVarsObj);
                console.log('mta',condAsm)
                // while(1){}
                let condRes = []
                for (let k of condAsm ){
                    console.log(k)
                    condRes = [...condRes, k]
                }

                let whileId = generateUID()
                console.log(bodyRes)
                
                i.asm = [
                    '# while begin',
                        `   while_${whileId}_condition: nop`,
                        ...condRes.map(i=> '   '+i),
                        '   popmi1 0',
                        '   ctomi2 0',
                        `   jmp.eq while_${whileId}_end`,
                        `   jmp while_${whileId}_inside`,
                    '# while body',
                        `   while_${whileId}_inside:nop`,
                        ...bodyRes.map(i=> '   '+i),
                    '# while epilog',
                        `   jmp while_${whileId}_condition`,
                        `   while_${whileId}_end:nop`,
                    '# while end'
                ]
                // while(1){}
            }
            else if(i.text=='return'){
                console.log(i.children[0])
                console.log(i)
                let retResAsm = mathToAsm(i.children[0],availableVarsObj);
                
                i.asm=[
                    '# return '+i.children[0].text,
                    '   # compute '+i.children[0].text,
                    ...retResAsm.map(i=>'      '+i),
                    '   # return is done from mi1',
                    '      popmi1 0',
                    `      jmp func_${funcName}_epilog`,
                    '# end return'
                ]
                // while((1)){}
            }
            else if (i.text=='func'){
                // while(1){console.log('func')}
                let funcName = i.children[0].children[0].text
                let bodyRes = []
                printConsoleTree(i)
                // crashes when function has arguments
                let bodyChild = getChildByText(i,'begin')
                let localVarSection = getChildByText(bodyChild,'var')
                if(bodyChild.children[0].text=='var')
                    bodyChild.children = bodyChild.children.splice(1)
                console.log('body child:',bodyChild)
                let localVars = parseVar(localVarSection)
                console.log('local var:',localVars)
                // while(1){}
                let args = arrayFromBin(getChildByText(i,'{').children[0],',')
                for(let k=args.length-1; k>=0; k--){
                    args[k]={
                        name:args[k].text,
                        size:1,
                        negOffset:args.length-k
                    }
                }
                console.log(getChildByText(i,'begin'))
                args = args.map(i=>({...i, negOffset:i.negOffset+localVars.totalSize})) //TODO: check
                console.log(args)
                console.log(localVars)
                // while(1){}
                let argsAndLocalVars =[...args, ...localVars.vars]
                console.log(argsAndLocalVars)
                // while(1){}

                // vars = vars.map()
                // console.log('args:',args)
                // while(1){}

                for (let k of 
                    compileLogicTree(
                        getChildByText(i,'begin'),
                        argsAndLocalVars,
                        argsAndLocalVars[0].negOffset+2,
                        funcName
                    ).children.map(i=>i.asm)){
                        console.log('k:',k)
                        bodyRes = [...bodyRes, ...k]
                }
                i.asm = [
                    `# func ${funcName} begin`,
                    `   jmp func_${funcName}_end`,
                    `   func_${funcName}_start:nop`,
                    `   malloc 0 ${localVars.totalSize}`,// TODO: calc size
                    `   memtosp 0`,
                    `# func body`,
                    ...bodyRes.map(i=> '   '+i),
                    '# func epilog',
                    `   func_${funcName}_epilog:nop`,
                    `   mfree 0 ${localVars.totalSize}`, // TODO: calc size
                    `   popmi2 0`,
                    `   pushmi1 0`,
                    `   pushmi2 0`,
                    `   ret 0`,
                    `   func_${funcName}_end:nop`,
                    '# func end'
                ]
                console.log('function build was successful')
                // while(1){}
                console.log(i)
            }
            else{
                console.log('text:',i)
                console.log(i.children[0].text!=':')
                if(i.children[0].text!=':'){
                    i.asm = [
                    ]
                    for(let k of arrayFromBin(i.children[0],',').map(i=>mathToAsm(i,globalVar))){
                        i.asm = [...i.asm, ...k]
                    }
                    i.asm.push('pushsp 0')
                    i.asm.push('pushaddr 0 5')
                    i.asm.push(`call func_${i.text}_start`)
                    i.asm.push(`popmi1 0`)
                    i.asm.push('popsp 0')
                    
                    console.log(i)
                    // while(1){}
                }
            }
        }
        return tree
    }
    compileLogicTree(tree)

    let res = []
    for(let i of tree.children){
        if (i.asm){
            res = [...res,...i.asm]
        }
    }
    return res.join('\n')
    

    // printConsoleTree(globalVar)
    // printConsoleTree(tree)
    
    
}
let code = `

module (main) begin
    
    var begin
        a, b: unsigned
    end


    func (u){x,y,z} begin    
        var begin
            i,k: unsigned[4]
            o:unsigned
        end
        $(y)  = x+y+z
    end


    func (sum2){x,y} begin    
        var begin
            i,k: unsigned
        end
        i  = x+y
    end

    b = 7
    u(b,@(b),9)

end


`

printConsoleTree(codeToTree(code))

console.log(compile(codeToTree(code)))
if(args.indexOf('--run')==-1)
    while(1){}  
import LLCompiler from './compiler.js'


import Device from './index.js'



let lc = new LLCompiler()
console.log(compile(codeToTree(code)))
// while(1){}
lc.parse(compile(codeToTree(code)))
console.log(lc.getProgmemByteString())

let d =new Device()
d.progmem=eval(lc.getProgmemByteString())

function runTicks(count){
    // for(let i=0; i<count; i++){
        while(d.cmdAddr<d.progmem.length+5){
            d.tick();
            // console.log('mem:', d.datamem)
            
            console.log('mi1: ', d.mi1)
            console.log('mi2: ',d.mi2)
            console.log('mem:', d.datamem)
            console.log('sp:', d.sp)
            console.log('ra:', d.ra)
        }
    // }
}

if(args.indexOf('--run')!=-1)
runTicks(50)