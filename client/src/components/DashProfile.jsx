import { Alert, Button, TextInput } from 'flowbite-react'
import  { useEffect, useRef,useState } from 'react'
import { useSelector } from 'react-redux'
import { updateStart,updateSuccess,updateFailure } from '../redux/user/userSlice'
import  {useDispatch} from 'react-redux';


export default function () {

    const  {currentUser} = useSelector(state => state.user)
    const [imageFile, setimageFile] = useState(null);
    const [imageUrl,setimageurl]= useState(null);
    const filePickRef=useRef()
    const [formData,setformData] =  useState({});
    const [updateUserSuccess,setUpdateUserSuccess] = useState(null);
    const dispatch = useDispatch();

    const handleImageChange = (e) =>{
        const file = e.target.files[0];
        if(file){
            setimageFile(file);
            setimageurl(URL.createObjectURL(file));

        }
      

    }
  useEffect (()=>{
    if( imageFile){
        uploadImage();
    }
  },[imageFile]);

  const uploadImage = async ()=>{
    console.log("uploadImage ....");
    
  }
    const handleChange =(e)=>{
      setformData({...formData, [e.target.id]: e.target.value})
    };

    const handleSubmit = async(e)=>{
      e.preventDefault();
      if(Object.keys(formData).length === 0){
        return;
      }
      try {
        dispatch(updateStart());
        const res = await fetch(`/api/user/update/${currentUser._id}`,{
          method: 'PUT',
          headers:{
            'Content-Type':'application/json'
          },
          body: JSON.stringify(formData),
        });
        const data = await res.json();
        if(!res.ok){
          dispatch(updateFailure(data.message))
        }else{
          dispatch(updateSuccess(data))
          setUpdateUserSuccess("User's profile updated successfully")
        }
      } catch (error) {
        dispatch(updateFailure(error.message))
      }
    };
    
  return (
    <div className='max-w-lg mx-auto p-3 w-full'>
        <h1 className='my-7 text-center font-semibold text-3xl'>
            Profile
              </h1>
    <form onSubmit={handleSubmit} className='flex flex-col gap-5'>
        <input type='file' accept='image/*' onChange={handleImageChange} ref={filePickRef} hidden />
        <div className='w-32 h-32 self-center cursor-pointer shadow-md overflow-hidden rounded-full' onClick={()=>
            filePickRef.current.click()
            
        } >
         
          <img src={imageUrl || currentUser.profilePicture} alt="User" className='rounded-full w-full h-full object-cover border-8 border-[lightgray]'/>
       
        </div>
        <TextInput type='text' id='username' placeholder='username' defaultValue={currentUser.username}
        onChange={handleChange}/>

        <TextInput type='email' id='email' placeholder='email' defaultValue={currentUser.email}
        onChange={handleChange}/>
       
        <TextInput type='password' id='password' placeholder='password'
        onChange={handleChange} />
        <Button type='submit' gradientDuoTone='purpleToBlue' outline>Update</Button>

       </form>
<div className='text-red-600 flex justify-between mt-5 mb-4'>
    <span className='cursor-pointer'>Delete Account</span>
    <span className='cursor-pointer'>Sign Out</span>
</div>
{updateUserSuccess && (
    <Alert color='success' className='mt-5'>
      {updateUserSuccess}
    </Alert>
  )
}
    </div>
  )
}
