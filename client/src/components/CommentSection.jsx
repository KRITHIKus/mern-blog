import {useSelector} from 'react-redux'
import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import {Alert, Button, Textarea} from 'flowbite-react'


export default function CommentSection({postId}) {

    const {currentUser} = useSelector(state => state.user)
    const [comment,setcomment] = useState('')
    const [commenterror,setcommenterror] = useState(null)
    const handleSubmit = async (e)=>{
        e.preventDefault();
        if (comment.length > 200 ){
           return
        }
        try {
             const res = await fetch (`/api/comment/create`,{
            method:'POST',
            headers:{
                'Content-Type' : 'application/json'
            },
            body: JSON.stringify({content: comment, postId, userId: currentUser.id}),
        });
        const data = await res.json();
        if(res.ok){
            setcomment();
            setcommenterror(null)

        }
          } catch (error) {
            setcommenterror(error.message)
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
                    <p className='text-gray-500 text-xs '>{200-comment.length} charcters remaining</p>
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
    </div>
  )
}
