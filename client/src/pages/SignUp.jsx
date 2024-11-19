import { Alert, Button, Label, Spinner, TextInput } from 'flowbite-react'
import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'


export default function SignUp() {
  const [formData,setfromData]=useState({})
  const [errormessage,seterrormessage]=useState(null)
  const [loading,setloading]=useState(false)
  const navigate = useNavigate();
  const handleChange =(e)=>{
 setfromData({...formData, [e.target.id]:e.target.value.trim() })
  };
  const handleSubmit = async (e)=>{
    e.preventDefault()

    if(!formData.username || !formData.email || !formData.password){
      return seterrormessage('Please fill-out all the fields')
    }

    try{
      setloading(true);
      seterrormessage(null);

      const res = await fetch('/api/auth/signup',{
        method:'POST',
        headers:{'Content-Type' : 'application/json' },
        body: JSON.stringify(formData),

      });

      const data = await res.json();
      if(data.success===false){
        return seterrormessage(data.message)
      }
      setloading(false)
      if(res.ok){
        navigate('/signin')
      }
    }catch (error){}
seterrormessage(errormessage.message)
setloading(false)
  };
 
  return (
    <div className='min-h-screen mt-20'>

<div className=' flex p-3 max-w-3xl mx-auto flex-col md:flex-row md:items-center gap-5'>
{/* left */}



<div className='flex-1'>
<Link to='/' 
className='font-bold dark:text-white text-4xl'>
    <span className='px-2 py-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-lg text-white'>A2D</span>
    Blog
    </Link>
  <p className=' text-sm mt-5'>
    You can sign-up with your email and password or with Google
  </p>



</div>
{/* right */}


<div className='flex-1'>
  <form className='flex flex-col gap-4' onSubmit={handleSubmit}><div className=''>
    <Label value='Your username'/>
    <TextInput
    type='text'
    placeholder='Username'
    id='username'
   onChange={handleChange} />
    </div>
  <div className=''>
    <Label value='Your email'/>
    <TextInput
    type='email'
    placeholder='Email'
    id='email'
    onChange={handleChange}
    />
    </div>
  <div className=''>
    <Label value='Your password'/>
    <TextInput
    type='password'
    placeholder='Password'
    id='password'
    onChange={handleChange}/>
    </div>
    <Button gradientDuoTone='purpleToPink' type='submit' disabled={loading}>
      {
        loading ? (
          <>
            <Spinner size='sm'/>
          <span className='pl-3'>loading...</span>
          </>
        
        ): ('Sign-up'
      )}
    </Button>
    
    </form>

    <div className='flex gap-2 text-sm mt-5'>
      <span>Have an account?</span>
      <Link to='signin' className='text-blue-500' >Sign In</Link>
    </div>
    {
      errormessage && (
        <Alert className='mt-5 ' color='failure'>
          {errormessage}
        </Alert>
      )
    }
</div>
</div>
</div>
  )
}
