const conif = import('node-console-input');

function parseInput(str){
    str = str.split(')').join(' ) ').split('(').join(' ( ').split('\n').join(' ')
    str = str.trim().split(/ +/).join(' ')
    let tokens = str.split(' ')
    let res = []
    let stack = [[]]
    for(let k of tokens){
        if(k=='('){
            // console.log('push to stack')
            stack.push([])
        }
        else if (k==')'){
            // console.log('stackki to stack: ', stack[stack.length-1], stack)
            stack[stack.length-2].push(stack[stack.length-1])
            stack.pop()
            // console.log(stack)
        }
        else{
            // console.log('push '+k)
            stack[stack.length-1].push(k)
        }
    }
    return stack
    return tokens
}

// console.log(JSON.stringify(parseInput(`
//     (define x 0)
//     (+  2 2 ( + 1 1))
//     ((if (> x 0) 
//         (= x 2) 
//         (= x 9)
//     ))`  
// )[0]))

class Runner{
    constructor(){
        this.context=[{}]
    }

    getContext(name){
        // console.log(`getting ${name}`)
        // console.log(this.context)
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
            for(let k of line){
                this.execLine(k)
            }
            return
        }
        // console.log(2)
        if(typeof(line)!='object')
            line=[line]
        // console.log(3)
        // console.log(line)
        switch(line[0]){
            case 'define':
                let name = line[1]
                let value = this.execLine(line[2])
                // if(!isNaN(parseInt(value)))
                    this.context[this.context.length-1][name] = value
                return null
            case '+':{
                let sum = 0;
                for(let i = 1; i<line.length; i++)
                    sum+=this.execLine(line[i])
                return sum
                // return this.execLine(line[2]) + this.execLine(line[1])
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
                return this.execLine(line[1]) > this.execLine(line[2])
            case '<':
                return this.execLine(line[1]) < this.execLine(line[2])
            case '=':
                return this.execLine(line[1]) == this.execLine(line[2])

            case 'if':
                if (this.execLine(line[1])){
                    return this.execLine(line[2])
                } else if(this.execLine(line[3]))
                    return this.execLine(line[3])
                return
            case 'while':
                while (this.execLine(line[1]))
                    this.execLine(line[2])
                return
            case 'lambda':
                // console.log(line)
                let args = line[1]
                return {type:'func',code:line[2],args}
                return 22
            break
            case 'print':
                console.log(this.execLine(line[1]))
                return 
            break
        }
        // console.log(4)
        if(!isNaN(parseInt(line[0])))
            return parseInt(line[0])
        // console.log(5)
        let v =this.getContext(line[0]) 
        // console.log('tassa')
        if(v.type=='func'){
            // return 11
            this.context.push({})
            // console.log('a')
            // console.log('before args:',this.context)
            for(let i = 1; i<=v.args.length; i++){
                // console.log('arg')
                // console.log(i,':"'),
                // console.log('line:',line)
                // console.log(`(define ${v.args[i-1]} ${line[i]})`)
                // console.log(':')
                // console.log(['define', v.args[i-1], line[i]])
                this.execLine(['define', v.args[i-1], line[i]])
                // console.log(parseInput(`(define ${v.args[i-1]} ${line[i]})`))
                // this.execLine(parseInput(`(define ${v.args[i-1]} ${line[i]})`))
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
// r.execLine(['define','u',['+','x','1']])
// r.parseExec(`(define x 1)`)
// r.parseExec(`(define u (+ x 4))`)
// r.parseExec(`(print u)`)
r.parseExecMulti(`
    (define x 2)
    (print x)
    (while (< x 10) (
        (print x)
        (define x (+ x 1)
    ))
`)
// `)[0][0])
// console.log(r)

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
// conif.getConsoleInput("> ", false);
