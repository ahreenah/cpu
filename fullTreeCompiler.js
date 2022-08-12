import {printConsoleTree, codeToTree} from './FullTreeParser.js'

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
        return [`pushc 0 ${tree.text}`]
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
    else{
        if(context[tree.text])
        return [
            `memspnegoffsettomi1 ${context[tree.text].negOffset}`,
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
    console.log(mathToAsm(rightItem.children[0], context))
}

function compile(code){

    console.log('a')
    let tree = codeToTree(code)
    console.log('b')
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
    for(let i of tree.children){
        console.log(i.text)
        if(i.text=='='){
            parseAssign(i, globalVar)
        }
    }
    // printConsoleTree(globalVar)
    // printConsoleTree(tree)
    
    
}

compile(`

module (main) begin

    var begin
        i, j, t: unsigned
        arr: unsigned[5]
    end

    x = 0
    x = 0
    i = 2

    z = 2 * (3 + 4) + arr
end

`)