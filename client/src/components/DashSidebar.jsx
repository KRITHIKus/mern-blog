import React from 'react'
import {Sidebar} from 'flowbite-react'
import {HiArrowSmRight, HiUser} from 'react-icons/hi'
import { useEffect ,useState} from 'react';
import { Link, useLocation } from 'react-router-dom';
import { siginOutSuccess } from '../redux/user/userSlice';
import { useDispatch } from 'react-redux';



export default function DashSidebar() {
    const location =useLocation();
  const [tab,setTab]= useState('')
    useEffect(()=>{
      const urlParams= new URLSearchParams(location.search)
      const tabFromUrl = urlParams.get('tab');
    if(tabFromUrl){
      setTab(tabFromUrl)
    }
      
    },[location.search]
  )
  const dispatch= useDispatch();
  const handleSignout = async ()=>{
    try {
      const res = await fetch('api/user/signout',{
        method: 'POST',
      });
      const data = await res.json();

      if(!res.ok){
        console.log(data.message)
      }else{
        dispatch(siginOutSuccess());
      }

    } catch (error) {
      console.log(error.message);
      
    }
  }
  return (
    <Sidebar className='w-full md:w-56'>
        <Sidebar.Items>
            <Sidebar.ItemGroup>
                <Link to='/dasboard?tab=profile'>
                <Sidebar.Item active={tab === 'profile'} icon={HiUser} label={'User'} labelColor='dark' as='div'>
                    
                    Profile
                </Sidebar.Item >
                </Link>
                
                <Sidebar.Item onClick={handleSignout} icon={HiArrowSmRight} className='cursor-pointer'>
                    Sign Out

                </Sidebar.Item>
            </Sidebar.ItemGroup>
        </Sidebar.Items>
    </Sidebar>
  )
}
