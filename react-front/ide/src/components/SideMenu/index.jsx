import styled from 'styled-components'
import Run from './Run'
import Build from './Build'

const Wrapper = styled.div`
display:flex;
padding:15px;
flex-direction:column;
color:white;
background:#101030
`


export default function({onCompile}){
    return <Wrapper>
        <Run/>
        <Build onClick={onCompile}/>
    </Wrapper>
}