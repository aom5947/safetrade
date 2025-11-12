import React from 'react'
import { Link, useLocation } from 'react-router'

const NotFound = () => {

  let location = useLocation()

  return (
    <div className="mx-auto w-9/12 h-dvh grid items-center justify-center">
      <div className='grid'>
        <div className='mb-4'>
          <h3 className="text-2xl font-medium text-gray-900 mb-1">ไม่พบข้อมูลใน</h3>
          <p className="text-sm text-gray-500">หน้าที่คุณค้นหาไม่มีอยู่นั้นไม่มีอยู่</p>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-1">{location.pathname}</h3>
        <Link to={'/'} className='border border-blue-500 hover:bg-blue-600 hover:text-white p-2 rounded-md my-2'>กลับสู่หน้าหลัก</Link>
      </div>
    </div>
  )
}

export default NotFound
