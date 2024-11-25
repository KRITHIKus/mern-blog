import { Button, Table, Modal } from 'flowbite-react';
import React, { useEffect, useState } from 'react'
import {useSelector} from 'react-redux'
import {FaCheck, FaTimes} from 'react-icons/fa'
import {HiOutlineExclamationCircle} from 'react-icons/hi'


export default function DashUsers() {   
  const {currentUser} = useSelector((state) => state.user)
  const [users,setuser] = useState ([]);
  const [showmore,setshowmore] = useState(true);
  const [showModal,setshowModal] = useState(false);
  const [userIdDelete,setuserIdToDelete]= useState('');

  
   useEffect(()=>{
      const fetchusers = async () =>{
      try {
        
        const res = await fetch(`/api/user/getusers`);
        const data = await res.json();
        if(res.ok){
          setuser(data.users)
          if(data.users.length < 9){
            setshowmore(false);
          }
        }
        console.log(data);
        
      } catch (error) {
        console.log(error.message);
        
        
      }
    }
    if(currentUser.isAdmin) {
      fetchusers();
}
},[currentUser._id])

const handleShowmore = async ()=>
{
  const startIndex = users.length;
  try {
    const res = await fetch(`/api/user/getusers?startIndex=${startIndex}`)
    const data = await res.json();
    if(res.ok){
      setuser((prev) => [...prev, ...data.users] );
      if(data.users.length < 9){
        setshowmore(false)
      }
    }

  

  } catch (error) {
    console.log((error.message));
    
  }
};

const handleDeleteUser = async ()=>{
//   setshowModal(false);
//   try {
//     const res = await fetch(`/api/user/deleteuser/${usIdDelete}/${currentUser._id}`,{
//       method: 'DELETE'
//     });
//     const data = await res.json();
//     if(!res.ok){
//       console.log(data.message);
//     }else{
//       setuserPosts((prev)=>
//       prev.filter((post)=> post._id !== postIdDelete)
//     );
//     }
//   } catch (error) {
//     console.log(error.message);
    
//   }

}
  return (
<div className='table-auto overflow-x-scroll md:mx-auto p-3 scrollbar
 scrollbar-track-slate-100 scrollbar-thumb-slate-300 dark:scrollbar-track-slate-700 
 dark:scrollbar-thumb-slate-300'>
{currentUser.isAdmin && users.length > 0 ? (
  <>
  <Table hoverable className='shadow-md '>
<Table.Head>
  <Table.HeadCell>Date Created</Table.HeadCell>
  <Table.HeadCell>User image</Table.HeadCell>
  <Table.HeadCell>Username</Table.HeadCell>
  <Table.HeadCell>Email</Table.HeadCell>
  <Table.HeadCell>Admin</Table.HeadCell>
  <Table.HeadCell>Delete</Table.HeadCell>
</Table.Head>
{users.map((user)=>(
  <Table.Body className='divide-y' key={user._id}>
    <Table.Row className='bg-white dark:border-gray-700 dark:bg-gray-800 '>
      <Table.Cell>{new Date(user.createdAt).toLocaleDateString()}</Table.Cell>
      <Table.Cell>
        <img
        src={user.profilePicture}
        alt={user.username}
        className='w-10 h-10 object-cover bg-gray-500 rounded-full'
        />
        
      </Table.Cell>
      <Table.Cell>{user.username}</Table.Cell>
      <Table.Cell>{user.email}</Table.Cell>
      <Table.Cell>{user.isAdmin ? (<FaCheck className='text-green-500'/>) : (<FaTimes className='text-red-500'/>)}</Table.Cell>
      <Table.Cell>
        <span onClick={()=>{
          setshowModal(true);
          setuserIdToDelete(user._id);

        }} className='font-medium text-red-500 hover:underline cursor-pointer'>
          Delete
        </span>
      </Table.Cell>
    
    </Table.Row>
  </Table.Body>

))}
  </Table>
  {
    showmore && (
      <button onClick={handleShowmore} className='w-full text-teal-500 self-center text-sm py-7'>
        show more
      </button>
    )
  }
  </>
): (
  <p>You have no users yet</p>
)}

<Modal 
show={showModal} onClose={()=>setshowModal(false)} popup
 size='md'>
<Modal.Header/>
<Modal.Body>
  <div className='text-center'>
    <HiOutlineExclamationCircle className='h-14 w-14 text-gray-400 
    dark:text-gray-200 mb-4 mx-auto' />
    <h3 className='mb-5 text-lg text-gray-500 dark:text-gray-400'>Are you sure you want to delete this user? </h3>
  </div>
<div className='flex justify-center gap-5'>
  <Button color='failure' onClick={ handleDeleteUser}>Yes, I'm sure</Button>
  <Button color='gray' onClick={()=> setshowModal(false)}>No, Cancel</Button>


</div>



</Modal.Body>

 </Modal>

</div>
  )
}
