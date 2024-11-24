import { Alert, Button, FileInput, Select, TextInput } from 'flowbite-react'
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import React, { useState } from 'react'
import{useNavigate} from 'react-router-dom'



export default function CreatePost() {
    const[formData, setformData]=useState()
    const [publishError,setpublishErorr] = useState(null);
    const navigate = useNavigate();

const handleSubmit = async(e)=>{
    e.preventDefault();
    try {
        const res = await fetch('/api/post/create',{
            method: 'POST',
            headers:{
                'Content-Type' : 'application/json',
            },
            body: JSON.stringify(formData),

        });
        const data = await res.json();
        if(!res.ok){
            setpublishErorr(data.message)
            return
        }
      
        if(res.ok){
            setpublishErorr(null);
            navigate( `/post/${data.slug}`)

        }
    } catch (error) {
        setpublishErorr("Something went wrong")
    }
}    

  return ( <div className='p-3 max-w-3xl mx-auto min-h-screen' >
<h1 className=' text-center text-3xl my-7 font-semibold'>Create a post</h1>

<form className='flex flex-col gap-4' onSubmit={handleSubmit}>
    <div className='flex flex-col gap-4 sm:flex-row justify-between'>
        <TextInput type='text' placeholder='Title' required id='Title'
        className='flex-1' onChange={(e)=>
            setformData({...formData, title: e.target.value})
        }/>
        <Select 
        onChange={(e)=>
            setformData({...formData,category: e.target.value})

        }>
            <option value="uncategorized">Select a category</option>
            <option value="javascript">JavaScript</option>
            <option value="reactjs">React JSy</option>
            <option value="nextjs">Next JS</option>
        </Select>

    </div>
    <div className='flex gap-4 items-center justify-between
     border-4 border-teal-500 border-dotted p-3'>
        <FileInput type='file' accept='image/*' />
        <Button type='button' gradientDuoTone='purpleToBlue' size='sm' outline>
            Upload Image
        </Button>

    </div>
<ReactQuill theme='snow' placeholder='Write something...'
 className='h-72 mb-12'
 required
 onChange={(value)=>{
         setformData({...formData,content: value})
        
    }
 }
 />
<Button type='submit' gradientDuoTone='purpleToPink' >Publish</Button>
{
    publishError && <Alert className='mt-5' color='failure'>{publishError}</Alert>
}
</form>

  </div>
    
  )
}
