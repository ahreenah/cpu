import styled from 'styled-components'
import {useState} from 'react'

const Editor = styled.div`
    display:flex
`

const LineCounter = styled.div`
`

const Wrapper = styled.div`
    position:relative;
    background:#101010;
    color:white;
    min-width:400px;
    min-height:calc(100vh - 55px);
    &.comment{
        color:#1010fa
    }
`

const HilightText = styled.div`
    // position:absolute;
    top:0;
    width:100%;
    color:#fafafa;
    left:0;
` 



const Editable = styled.div`
    // position:absolute;
    padding:10px;
    width:100%;
    top:0;
    left:0;
    color: red;
    background: #00000000;
    caret-color: red;
    border:none;
    outline:none;

    position: absolute;
    top: 0;
    left: 0;
    padding: 0 !important;
    color: #00000000 !important;
` 


const baseColors={
    operator:'#5050fa'
}
const commands = {
    operator:['nop','jmp','ctomi1','ctomi2','mosumtomi1', 'mosubtomi1','ctomem','memtomi1','mi1tomemra','mi1tomem','memtomi2','mi2tomem','ctora','incra','decra','memratomi2','mi2tomemra','mi2tora','ratomi2','swpmi','mi1tora','nop']
}
const colors={
    'nop':baseColors.operator,
    'jmp':'#fa1010',
}
for (let i of commands.operator){
    colors[i]=baseColors.operator
}

export default function({onChange}){
    let [code,setCode]=useState('1')
    function onInputCode(v){

        console.log(v.target.innerHTML)
        let editHtml = v.target.innerHTML;
        console.log(editHtml)
        console.log(editHtml.split(/<\/?div>/))
        
        // console.log()
        let lines = editHtml.split(/<\/?div>/).filter((i,num)=>num%2==1).map(i=>i.replace('<br>',''))

        onChange(lines.join('\n'))
        
        console.log('lines:',lines)
        let r = /(#.*<?)/g;
        let r2 =  /(.*:)/g;
        lines.map((t,num)=>{
            // if(t ) 
            lines[num] = lines[num].replace(/(.*:)/,v=>'<span class="label">'+v+'</span>')
            lines[num] = lines[num].replace(/(#.*)/,v=>'<span class="comment">'+v+'</span>')
            Object.keys(colors).map(key=>{
                lines[num] = lines[num].replace(key,'<span style="color:'+colors[key]+'">'+key+'</span>')
                if(lines[num]=='')
                lines[num]='&nbsp;'}
            )
            console.log('s2');
            console.log(lines[num], ' -> ', lines[num].replace(r,v=>'<span style="color:#505050 !important">'+v+'</span>'))
            setCode(lines)
        })
        /*
        // for (let i in colors){
        //   t=t.replaceAll(i,'<span style="color:'+colors[i]+'">'+i+'</span>');
        // }
        area1.innerHTML = lines.join('<br>');//editor2.innerHTML;
        */
    }

    return(
        <div>
            <LineCounter/>  
            <Wrapper>
                {code?.map?.(i=><div dangerouslySetInnerHTML={{__html:i}} />)}
                <Editable contentEditable onInput={onInputCode}></Editable>

            </Wrapper>
        </div>
    )
}