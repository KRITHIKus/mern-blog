import { Alert, Button, Modal, TextInput } from 'flowbite-react'
import  { useEffect, useRef,useState } from 'react'
import { useSelector } from 'react-redux'
import { updateStart,updateSuccess,updateFailure,
  deleteUserStart,deleteUserSuccess,deleteUserFailure

 } from '../redux/user/userSlice'
import  {useDispatch} from 'react-redux';
import {HiOutlineExclamationCircle} from 'react-icons/hi'


export default function () {

    const  {currentUser, error} = useSelector(state => state.user)
    const [imageFile, setimageFile] = useState(null);
    const [imageUrl,setimageurl]= useState(null);
    const filePickRef=useRef()
    const [formData,setformData] =  useState({});
    const [updateUserSuccess,setUpdateUserSuccess] = useState(null);
    const [updateUserError,setUpdateUserError] = useState(null);
    const [showModal,setshowModal] = useState(false);
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
      setUpdateUserError(null);
      setUpdateUserSuccess(null);
      if(Object.keys(formData).length === 0){
        setUpdateUserError('No changes made')
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
          setUpdateUserError(data.message)
        }else{
          dispatch(updateSuccess(data))
          setUpdateUserSuccess("User's profile updated successfully")
        }
      } catch (error) {
        dispatch(updateFailure(error.message))
        setUpdateUserError(data.message)

      }
    };
    
    const handleDeleteUser = async ()=>{
      setshowModal(false);
      try {
        dispatch(deleteUserStart());
        const res = await fetch (`api/user/delete/${currentUser._id}`,{
          method: 'DELETE',
       } );
       const data = await res.json();
       if(!res.ok){
        dispatch(deleteUserFailure(data.message));
       }else{
        dispatch(deleteUserSuccess(data))
       }
      } catch (error) {
        dispatch(deleteUserFailure(error.message))
        
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
    <span onClick={()=>setshowModal(true)} className='cursor-pointer'>Delete Account</span>
    <span className='cursor-pointer'>Sign Out</span>
</div>
{updateUserSuccess && (
    <Alert color='success' className='mt-5'>
      {updateUserSuccess}
    </Alert>
  )
}
{updateUserError && (
    <Alert color='failure' className='mt-5'>
      {updateUserError}
    </Alert>
  )
}

{error && (
    <Alert color='failure' className='mt-5'>
      {error}
    </Alert>
  )
}



<Modal show={showModal} onClose={()=>setshowModal(false)} popup
 size='md'>
<Modal.Header/>
<Modal.Body>
  <div className='text-center'>
    <HiOutlineExclamationCircle className='h-14 w-14 text-gray-400 
    dark:text-gray-200 mb-4 mx-auto' />
    <h3 className='mb-5 text-lg text-gray-500 dark:text-gray-400'>Are you sure you want to delete this account? </h3>
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
