import styled from 'styled-components'

const Wrapper = styled.div`
    position:relative;
`

const Button = styled.div`
    padding:4px;
    color:#fefefe;
    cursor:pointer;
    padding-left:10px;
    padding-right:10px; 
    &:hover{
        background:#ffffff10;
    }
`

export default function({title}){
    return (
        <Wrapper>
            <Button>
                {title}
            </Button>
        </Wrapper>
    )
}