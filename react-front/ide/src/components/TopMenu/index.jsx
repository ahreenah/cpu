import styled from 'styled-components'
import MenuList from './MenuList'

const Wrapper = styled.div`
display:flex;
padding:2px;
color:white;
background:#202040
`



export default function(){
    return <Wrapper>
        <MenuList title='File'/>
    </Wrapper>
}