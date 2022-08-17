const conif = import('node-console-input');

function parseInput(str){
    str = str.split(')').join(' ) ').split('(').join(' ( ').split('\n').join(' ')
    str = str.trim().split(/ +/).join(' ')
    let tokens = str.split(' ')
    let res = []
    let stack = [[]]
    for(let k of tokens){
        if(k=='('){
            stack.push([])
        }
        else if (k==')'){
            stack[stack.length-2].push(stack[stack.length-1])
            stack.pop()
        }
        else{
            stack[stack.length-1].push(k)
        }
    }
    return stack
}


class Runner{
    constructor(){
        this.context=[{}]
    }

    getContext(name){
        let i = this.context.length-1
        while(i>=0){
            if(name in this.context[i])
                return this.context[i][name]
            else i--
        }
        throw 'Error: ' + name + ' is not defined'
    }
    
    execLine(line){
        // console.log('line:',line)
        // console.log(1)
        if(typeof(line[0])=='object'){
            let res = undefined
            for(let k of line){
                res = this.execLine(k)
            }
            return res
        }
        if(typeof(line)!='object')
            line=[line]
        switch(line[0]){
            case 'define':
                let name = line[1]
                let value = this.execLine(line[2])
                    this.context[this.context.length-1][name] = value
                return null
            case '+':{
                let sum = 0;
                for(let i = 1; i<line.length; i++)
                    sum+=this.execLine(line[i])
                return sum
            }
            case '-':
                return this.execLine(line[1]) - this.execLine(line[2])
            case '*':{
                let mul = 1;
                for(let i = 1; i<line.length; i++)
                    mul *= this.execLine(line[i])
                return mul
            }
            case '/':
                return this.execLine(line[1]) / this.execLine(line[2])
            case '>':
                return this.execLine([line[1]]) > this.execLine([line[2]])
            case '<':
                return this.execLine([line[1]]) < this.execLine([line[2]])
            case '=':
                return this.execLine(line[1]) == this.execLine(line[2])

            case 'if':
                if (this.execLine(line[1])){
                    return this.execLine(line[2])
                }else{
                    if(line[3])
                        return this.execLine(line[3])
                    return undefined
                }

            case 'while':
                while (this.execLine(line[1]))
                    this.execLine(line[2])
                return

            case 'lambda':
                let args = line[1]
                return {type:'func',code:line[2],args}
                
            case'arrayGet':{
                let arrayName = line[1]
                let index = this.execLine(line[2])
                return this.getContext(arrayName)[index]
            }

                
            case'arraySet':{
                let arrayName = line[1]
                let index = this.execLine(line[2])
                let value = this.execLine(line[3])
                return this.getContext(arrayName)[index] = value
            }

            case 'print':
                console.log(this.execLine(line[1]))
                return 
            break
        }
        if(!isNaN(parseInt(line[0]))){
            if(line.length==1){
                return parseInt(line[0])
            }
            return line.map(i => this.execLine (i) )
        }
        let v =this.getContext(line[0]) 
        if(v.type=='func' && line.length>1){
            this.context.push({})
            for(let i = 1; i<=v.args.length; i++){
                this.execLine(['define', v.args[i-1], line[i]])
            }
            // console.log('after args:',this.context)
            let res = this.execLine(v.code)
            this.context.pop()
            return res
        }
        return v
    }
    parseExec(s){
        this.execLine(parseInput(s))
    }
    parseExecMulti(s){
        this.execLine(parseInput(s.split('\n').join(' ')))
    }
}

let r = new Runner()
r.parseExecMulti(`
    (define min (lambda (x y)  
        (if (> x y) y x)
    ))

    (define max (lambda (x y)  
        (if (> x y) x y)
    ))

    (define gt2 (lambda (x)
        (if (> x 2) 
            (+ (gt2 (- x 1)) (gt2 (- x 2)))
            1
        )
    ))

    (define x2p3 (lambda (x)
        (

            (define add1 (lambda (x)
                (
                    (+ x 1)
                )
            ))
            (define add2 (lambda (x)
                (
                    (+ x 2)
                )
            ))

            (define t (add2 x))
            (define k (add2 x))

            (+ k t)
        )
    ))

    (define arr (47 41 1 15 12 4 39 7 14 16 17 19 5 26 46 2 25 27 11 48 24 36 9 38 49 31 40 35 42 20))

    (define y 29)
    (while (> y 0) (
        (define x 0)
        (while (> y x) (
            (define t1 (arrayGet arr x))
            (define t2 (arrayGet arr (+ x 1)))
            (if (> t1 t2) (
                (arraySet arr x t2)
                (arraySet arr (+ x 1) t1)
            ))
            (define x (+ x 1))
        ))
        (define y (- y 1))
    ))
    (print (gt2 2))
    (print (max 4 9))
    (print (gt2 7))
    
`)

async function t(){
    let conif2 = (await conif).default;
    console.log(conif2)
    while(1){
        let input = await conif2.getConsoleInput('> ')
        // console.log(';i: ', parseInput(input))
        let s = input;
        while( [...s].filter(i=>i=='(').length > [...s].filter(i=>i==')').length){
            input = await conif2.getConsoleInput('> ')
            s+=input+' '
        }
        if (input=='exit')
            break
        console.log('->',r.execLine(parseInput(s)[0][0]))
    }

}

t()
