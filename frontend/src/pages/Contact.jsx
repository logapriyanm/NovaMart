import React from 'react'
import Title from '../components/Title'
import { assets } from '../assets/assets'
import NewsletterBox from '../components/NewsletterBox'

const Contact = () => {
  return (
    <div>

      <div className='text-2xl text-center py-20 border-t'>
        <Title text1={'Contact'} text2={'Us'} />
      </div>

      <div className="my-2 flex flex-col md:flex-row items-center justify-center gap-10 mb-28">
        {/* Left Image */}
        <img
          className="w-full md:max-w-[480px]"
          src={assets.contact_img}
          alt="Contact"
        />

        {/* Right Info */}
        <div className="flex flex-col justify-center items-start gap-6 text-start">
          <p className="font-semibold text-xl text-gray-600">Our Store</p>
          <p className="text-gray-500">
           34, MGR Street <br /> Erode bus stand, Erode
          </p>
          <p className="text-gray-500">
            Contact: 9876543210 <br /> Email: novamart@gmail.com
          </p>
          <p className="font-semibold text-xl text-gray-600">Careers at Forever</p>
          <p className="text-gray-500">
            Learn more about our teams and job openings
          </p>
          <button className="border cursor-pointer border-black px-8 py-4 text-sm hover:bg-black hover:text-white transition-all duration-500">
            Explore Jobs
          </button>
        </div>
      </div>


      <NewsletterBox />
    </div>
  )
}

export default Contact
