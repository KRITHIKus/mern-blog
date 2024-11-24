import { Button, Table, Modal } from 'flowbite-react';
import React, { useEffect, useState } from 'react'
import {useSelector} from 'react-redux'
import { Link } from 'react-router-dom';
import {HiOutlineExclamationCircle} from 'react-icons/hi'


export default function DashPosts() {   
  const {currentUser} = useSelector((state) => state.user)
  const [userPosts,setuserPosts] = useState ([]);
  const [showmore,setshowmore] = useState(true);
  const [showModal,setshowModal] = useState(false);
  const [postIdDelete,setPostIdToDelete]= useState('');

  
   useEffect(()=>{
      const fetchPosts = async () =>{
      try {
        
        const res = await fetch(`/api/post/getposts?userId=${currentUser._id}`);
        const data = await res.json();
        if(res.ok){
          setuserPosts(data.posts)
          if(data.posts.length > 9){
            setshowmore(false);
          }
        }
        console.log(data);
        
      } catch (error) {
        console.log(error.message);
        
        
      }
    }
    if(currentUser.isAdmin) {
      fetchPosts();
}
},[currentUser._id])

const handleShowmore = async ()=>
{
  const startIndex = userPosts.length;
  try {
    const res = await fetch(`/api/post/getposts?userId=${currentUser._id}&startIndex=${startIndex}`)
    const data = await res.json();
    if(res.ok){
      setuserPosts((prev) => [...prev, ...data.posts] );
      if(data.posts.length < 9){
        setshowmore(false)
      }
    }

  

  } catch (error) {
    console.log((error.message));
    
  }
};

const handleDeletePost = async ()=>{
  setshowModal(false);
  try {
    const res = await fetch(`/api/post/deletepost/${postIdDelete}/${currentUser._id}`,{
      method: 'DELETE'
    });
    const data = await res.json();
    if(!res.ok){
      console.log(data.message);
    }else{
      setuserPosts((prev)=>
      prev.filter((post)=> post._id !== postIdDelete)
    );
    }
  } catch (error) {
    console.log(error.message);
    
  }

}
  return (
<div className='table-auto overflow-x-scroll md:mx-auto p-3 scrollbar
 scrollbar-track-slate-100 scrollbar-thumb-slate-300 dark:scrollbar-track-slate-700 
 dark:scrollbar-thumb-slate-300'>
{currentUser.isAdmin && userPosts.length > 0 ? (
  <>
  <Table hoverable className='shadow-md '>
<Table.Head>
  <Table.HeadCell>Date Updated</Table.HeadCell>
  <Table.HeadCell>Post Image</Table.HeadCell>
  <Table.HeadCell>Post Title</Table.HeadCell>
  <Table.HeadCell>Category</Table.HeadCell>
  <Table.HeadCell>Delete</Table.HeadCell>
  <Table.HeadCell>
    <span >Edit</span>
  </Table.HeadCell>
</Table.Head>
{userPosts.map((posts)=>(
  <Table.Body className='divide-y'>
    <Table.Row className='bg-white dark:border-gray-700 dark:bg-gray-800'>
      <Table.Cell>{new Date(posts.updatedAt).toLocaleDateString()}</Table.Cell>
      <Table.Cell>
        <Link to={`post/${posts.slug}`}>
        <img
        src={posts.image}
        alt={posts.title}
        className='w-20 h-10 object-cover bg-gray-500'
        />
        </Link>
      </Table.Cell>
      <Table.Cell>
        <Link className='font-medium text-gray-900 dark:text-white' to={`post/${posts.slug}`}>{posts.title}
        </Link>
      </Table.Cell>
      <Table.Cell>
        {posts.category}
      </Table.Cell>
      <Table.Cell>
        <span onClick={()=>{
          setshowModal(true);
          setPostIdToDelete(posts._id);

        }} className='font-medium text-red-500 hover:underline cursor-pointer'>
          Delete
        </span>
      </Table.Cell>
      <Table.Cell>
        <Link className='text-teal-500 hover:underline' to={`/update-post/${posts._id}`}>
        <span>Edit</span>
        </Link>
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
  <p>You have no posts yet</p>
)}

<Modal 
show={showModal} onClose={()=>setshowModal(false)} popup
 size='md'>
<Modal.Header/>
<Modal.Body>
  <div className='text-center'>
    <HiOutlineExclamationCircle className='h-14 w-14 text-gray-400 
    dark:text-gray-200 mb-4 mx-auto' />
    <h3 className='mb-5 text-lg text-gray-500 dark:text-gray-400'>Are you sure you want to delete this post? </h3>
  </div>
<div className='flex justify-center gap-5'>
  <Button color='failure' onClick={ handleDeletePost}>Yes, I'm sure</Button>
  <Button color='gray' onClick={()=> setshowModal(false)}>No, Cancel</Button>


</div>



</Modal.Body>

 </Modal>

</div>
  )
}
