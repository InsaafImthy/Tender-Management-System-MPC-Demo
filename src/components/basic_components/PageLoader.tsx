import React from 'react'
import { Spin } from 'antd';

const PageLoader:React.FC = () => {
  return (
    <div style={{width:"100%",height:"100%",display:"flex",justifyContent:"center",alignItems:"center"}}><Spin/></div>
  )
}

export default PageLoader