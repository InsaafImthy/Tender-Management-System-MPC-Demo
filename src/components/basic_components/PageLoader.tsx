import React from 'react'
import { Spin } from 'antd';

const PageLoader:React.FC = () => {
  return (
    <div className="flex min-h-[240px] w-full items-center justify-center">
      <div className="app-surface flex items-center gap-3 px-5 py-4">
        <Spin />
        <span className="text-sm font-semibold text-slate-600">Loading</span>
      </div>
    </div>
  )
}

export default PageLoader
