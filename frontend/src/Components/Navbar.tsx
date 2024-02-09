import React from 'react'

const Navbar = () => {
  return (
    <div className='w-screen px-[10vw] box-border flex items-center justify-between py-5 border-b bg-black border-b-[#181819] sticky top-0'>
      <img src="/logo.png" alt="logo" className='w-14'/>

      <div>
        <button className='bg-[#262629] rounded-lg py-2 px-5 text-[#cacacb] hover:bg-[#2f2f33] flex items-center gap-4' onClick={()=>{
          window.open("https://www.instagram.com/ssinghyuvraj02/")
        }}>
          <img src="/my.png" alt="" className='w-10 h-10 rounded-full'/>
          Follow on Instagram</button>
      </div>
    </div>
  )
}

export default Navbar