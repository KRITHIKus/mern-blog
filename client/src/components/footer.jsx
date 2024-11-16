import { Footer } from 'flowbite-react'
import React from 'react'
import { Link } from 'react-router-dom'
import {BsReddit,BsGithub,BsLinkedin,BsPersonFill} from 'react-icons/bs'

export default function footer() {
  return (
 <Footer container className='border border-t-8 border-teal-500'>

<div className='w-full max-w-7xl'>
    <div className='grid  w-full justify-between sm:flex md:grid-cols-1'>
        <div className='mt-5 '>
        <Link to='/' className='self-center whitespace-nowrap text-lg sm:text-xl font-semibold dark:text-white'>
    <span className='px-2 py-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-lg text-white'>A2D</span>
    Blog
    </Link>


        </div>
        <div className='grid grid-cols-2 gap-8 mt-5 sm:grid-cols-3 sm:gap-6'>
<div> <Footer.Title title='About'/>
            <Footer.LinkGroup col>
                <Footer.Link href='https://krithik.onrender.com'
                target='_blank'
                rel='noopener noreferrer'
                >
                  My Portfolio
                </Footer.Link>

                <Footer.Link href='/about'
                target='_blank'
                rel='noopener noreferrer'
                >
                  A2d Blog
                </Footer.Link>
            </Footer.LinkGroup>
            </div>
            

            <div> <Footer.Title title='Follow us'/>
            <Footer.LinkGroup col>
                <Footer.Link href='https://github.com/KRITHIKus'
                target='_blank'
                rel='noopener noreferrer'
                >
                  GitHub
                </Footer.Link>

                <Footer.Link href='https://www.linkedin.com/in/krithik-u-s-a545a4326/'
                target='_blank'
                rel='noopener noreferrer'
                >
                  LinkedIn
                </Footer.Link>
            </Footer.LinkGroup>
            </div>
           
            <div> <Footer.Title title='Legal'/>
            <Footer.LinkGroup col>
                <Footer.Link href='#'>
                     Policy
                  
                </Footer.Link>

                <Footer.Link href='#' >
                Terms &amp; Conditions
                </Footer.Link>
            </Footer.LinkGroup>
            </div>

        </div>
    
    </div>

    <Footer.Divider/>
    <div className='w-full sm:flex sm:items-center sm:justify-between'> 
        <Footer.Copyright href='#' by='A2D Blog' year={new Date().getFullYear()}/> 
        <div  className='flex gap-6 sm:mt-0 mt-4 sm:justify-center'> 
              <Footer.Icon href='#' icon={BsReddit}/>
          <Footer.Icon href='#' icon={BsGithub}/>
          <Footer.Icon href='#' icon={BsLinkedin}/>
          <Footer.Icon href='#' icon={BsPersonFill}/>
          </div>
       </div>
       </div>



 </Footer>
  )
}
