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

function compile(code){

    let tree = codeToTree(code)
    let globalVar = getChildByText(tree,'var')
    console.log('s:',JSON.stringify(parseVar(globalVar)))
    printConsoleTree(globalVar)
    // printConsoleTree(tree)
    
    
}

compile(`

module (main) begin

    x = 0
    var begin
        i, j, t: unsigned
        arr: unsigned[5]
        k,p: unsigned[3]
    end

    i = 2
    j = 5
    if (i>j) begin 
        t = i i = j j = t
    end

end

`)