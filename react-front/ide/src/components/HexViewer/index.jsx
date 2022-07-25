export default function({data}){
    return <div style={{color:'white'}}>

        {data.map(i=>(
            <div>{i.addr}:{i.bytes}</div>
        ))}
    </div>
}