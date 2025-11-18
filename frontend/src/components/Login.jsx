import React from 'react'
import { useForm } from 'react-hook-form'
import { api } from '@/services/api'

const Login = () => {
  const { register, handleSubmit, formState: { errors } } = useForm()

  const onSubmit = async (data) => {
    try {
      const response = await api.post('/users/signin', {
        email: data.email,
        password: data.password,
      })

      if (response.data.success) {
        localStorage.setItem('userData', JSON.stringify(response.data))
        alert('เข้าสู่ระบบสำเร็จ!')
        window.location.href = '/admin' // หากต้องการ redirect
      } else {
        alert(response.data.message || 'เข้าสู่ระบบไม่สำเร็จ')
      }
    } catch (error) {
      console.error('Login error:', error)
      toast.error(error.response?.data.message)
      // alert('เกิดข้อผิดพลาดในการเข้าสู่ระบบ')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8">
        <h2 className="text-2xl font-semibold text-center text-gray-700 mb-6">
          เข้าสู่ระบบ
        </h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Username */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">ชื่อผู้ใช้</label>
            <input
              type="text"
              {...register('email', { required: 'กรุณากรอกชื่อ email' })}
              className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.username ? 'border-red-500' : 'border-gray-300'
                }`}
            />
            {errors.username && (
              <p className="text-red-500 text-sm mt-1">{errors.username.message}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">รหัสผ่าน</label>
            <input
              type="password"
              {...register('password', { required: 'กรุณากรอกรหัสผ่าน' })}
              className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.password ? 'border-red-500' : 'border-gray-300'
                }`}
            />
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            เข้าสู่ระบบ
          </button>
        </form>
      </div>
    </div>
  )
}

export default Login
