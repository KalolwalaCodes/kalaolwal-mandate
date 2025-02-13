import React, { useState } from 'react'

const TableCell = () => {
    const [colSpan, setColSpan] = useState(1)
  return (
    <td colSpan={colSpan} style={{padding: 0}}>
        <input style={{
          textAlign: 'center',
          width: '100%'
        }} value={colSpan} onChange={(e)=>setColSpan(e.target.value)}/>
    </td>
  )
}

export default TableCell