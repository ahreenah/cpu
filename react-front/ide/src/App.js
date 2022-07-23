import logo from './logo.svg';
import './App.css';
import {useState} from 'react'
import styled from 'styled-components';
import TopMenu from './components/TopMenu/index';
import SideMenu from './components/SideMenu/index';
import StatusBar from './components/StatusBar';
import Editor from './components/Editor'
import Compiler from './compiler/compiler.js'
import HexViewer from './components/HexViewer/index.jsx'


const Wrapper = styled.div`
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  background:#202020;
`

const Editors = styled.div`
  display:flex;
  flex-grow:1
`

function App() {
  let [code,setCode] = useState('')
  let [compiledCode, setCompiledCode] = useState([])
  function onCodeChange(v){
    console.log('code: ',v)
    setCode(v)
  }
  function compile(){
    let c1 = new Compiler()
    console.log('code',code)
    c1.parse(code)
    console.log(c1)
    setCompiledCode(c1.lines)
  }
  return (
    <Wrapper>
      <TopMenu/>
      <Editors>
        <SideMenu onCompile={compile}/>
        <Editor onChange={onCodeChange}/>
        <HexViewer data={ compiledCode}/>
      </Editors>
      <StatusBar/>
    </Wrapper>
  );
}

export default App;
