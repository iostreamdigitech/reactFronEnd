import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { setToken } from '../../utils/UserAuth.js';

const API_BASE = import.meta.env.VITE_API_BASE  // ✅ Use env variable

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      })

      if (!res.ok) {
        throw new Error('Invalid credentials')
      }

      const data = await res.json()
      if (data.token) {
        setToken(data.token)
        navigate('/dashboard')
      } else {
        throw new Error('No token in response')
      }
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#0B0E1A]">
      <form 
        onSubmit={handleSubmit} 
        className="bg-[#1C1F2A] shadow-xl rounded-2xl p-8 w-[400px] text-white"
      >
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <img src="/src/assets/logo.png" alt="main-logo" className="h-10" />
        </div>

        {/* Email */}
        <div className="mb-4">
          <label className="block text-sm mb-2">User Name/Email</label>
          <input 
            type="text" 
            placeholder="Enter User Name"
            value={username} 
            onChange={(e) => setUsername(e.target.value)} 
            className="w-full p-3 bg-[#12141F] border border-[#2E3244] rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Password */}
        <div className="mb-4">
          <label className="block text-sm mb-2">Password</label>
          <input 
            type="password" 
            placeholder="********"
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            className="w-full p-3 bg-[#12141F] border border-[#2E3244] rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Remember Me */}
        <div className="flex items-center mb-6">
          <input type="checkbox" id="remember" className="mr-2" />
          <label htmlFor="remember" className="text-sm text-gray-300">Remember Me</label>
        </div>

        {/* Error */}
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        {/* Login Button */}
        <button 
          type="submit" 
          className="w-full bg-[#6C63FF] text-white py-3 rounded-md hover:bg-[#5A52D4] transition"
        >
          Log in
        </button>
      </form>
    </div>
  )
}
