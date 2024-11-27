import {useSelector} from 'react-redux'
import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {Alert, Button, Textarea} from 'flowbite-react'
import Comment from './Comment'



export default function CommentSection({postId}) {

    const {currentUser} = useSelector(state => state.user)
    const [comment,setcomment] = useState('')
    const [commenterror,setcommenterror] = useState(null)
    const [comments,setcomments] = useState([]);
    const navigate = useNavigate();
    console.log(comments);
    
    const handleSubmit = async (e)=>{
        e.preventDefault();
        if (comment.length > 200 ){
           return
        }
        try {
             const res = await fetch ('/api/comment/create',{
            method:'POST',
            headers:{
                'Content-Type' : 'application/json'
            },
            body: JSON.stringify({content: comment, postId, userId: currentUser._id}),
        });
        const data = await res.json();
        if(res.ok){
            setcomment('');
            setcommenterror(null)
            setcomments((prev) => [...prev,data])

        }
          } catch (error) {
            setcommenterror(error.message)
    }
      
            
        }
        useEffect(()=>{

            const getComments =async ()=> {

                try {
                    const res = await fetch(`/api/comment/getPostComments/${postId}`);
                    if(res.ok){
                        const data = await res.json();
                        setcomments(data);
                    }
                } catch (error) {
                    console.log(error)
                }

            }
            getComments();


        },[postId])
       

        const handleLike = async (commentId)=>{
            try {
                if (!currentUser){
                    return navigate('/signin')
                }
              const res = await fetch (`/api/comment/likeComment/${commentId}`,{
                  method : 'PUT',
                } ) 
            if(res.ok){
                   const data = await res.json();

                   setcomments((prevComments)=>
                   prevComments.map((comment)=>
                    comment._id === commentId ? {
                    ...comment,
                    likes : data.likes,
                    numberOfLikes : data.likes.length,
                    
                    } : comment
                   )
                )
            }
             
              
            } catch (error) {
                console.log(error.message);
                
            }
        }

  return (
    <div className='max-w-2xl mx-auto w-full p-3'>
        {currentUser ? 
        (
            <div className='flex items-center gap-1 my-5 text-gray-500 text-sm'>
                <p>Signed in as:</p>
                <img className='h-5 w-5 object-cover rounded-full' src={currentUser.profilePicture}/>
                <Link to={'/dashboard?tab=profile'} className='text-sm 
                text-cyan-600 hover:underline'>
                @{currentUser.username}
                </Link>

            </div>
        ):
        (
            <div className='text'>
                You must be signed in to comment.
                <Link to={'/signin'}>
                signin
                </Link>
            </div> 
        )
        }
        {currentUser &&  (
            <form onSubmit={handleSubmit} className='border border-teal-500 rounded-md p-3'> 
                <Textarea
                placeholder='Add a comment'
                row = '3'
                maxLength='200'
                onChange={(e)=> 
                    setcomment(e.target.value)}
                    value= {comment}
                    />
                <div className='flex justify-between items-center mt-5 '>
                    <p className='text-gray-500 text-xs '>{200 - comment.length} charcters remaining</p>
                    <Button outline gradientDuoTone='purpleToBlue' type='submit'>
                        Submit
                    </Button>
                </div>
                {commenterror &&(
                   <Alert color={'failure'} className='mt-5'> {commenterror}
           
            </Alert> 
                )}
               
            </form>
            
        )}
        {comments.length === 0 ? (
            <p className='text-sm my-5'>No comments yet</p>
        ):(
            <>
            
              <div className='text-sm my-5 flex items-center gap-1'>
                <p>Comments</p>
                <div className='border border-gray-400 py-1 px-2 rounded-sm'>
                    <p>{comments.length}</p>
                </div>
            </div>
            {
                comments.map((comment,index) => (
                    <Comment key={comment._id || index } 
                    comment={comment} onLike={handleLike}/>
                ))
            }
            </>
          

        )}
    </div>
  )
}
