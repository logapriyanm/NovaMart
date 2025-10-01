import React from 'react'
import Title from "../components/Title"
import { assets } from '../assets/assets'
import NewsletterBox from "../components/NewsletterBox"

const About = () => {
  return (
    <div className='p-10'>

      <div className='text-2xl text-center pt-8 border-t'>
        <Title text1={'About'} text2={'Us'} />
      </div>

      <div className='my-10 flex flex-col md:flex-row gap-16'>
        <img className='w-full md:max-w-[450px]' src={assets.about_img} alt="About Us" />
        <div className='flex flex-col justify-center gap-6 md:w-2/4 text-gray-600'>
          <p>
            We are a passionate team dedicated to bringing high-quality products and services that add value to your everyday life. 
            Our goal is to blend innovation with reliability, ensuring that every customer experiences the best we have to offer.
          </p>
          <p>
            With years of expertise and a customer-first approach, we strive to create solutions that make your journey with us simple, enjoyable, and memorable.
          </p>
          <b className='text-gray-800'>Our Mission</b>
          <p>
            Our mission is to provide exceptional quality, trustworthy service, and a seamless experience. 
            We believe in building long-lasting relationships with our customers by consistently exceeding expectations and delivering value at every step.
          </p>
        </div>
      </div>

      <div className='text-xl py-4'>
        <Title text1={'Why'} text2={'Choose Us'} />
      </div>

      <div className='flex flex-col md:flex-row text-sm mb-20'>
        <div className='border px-10 md:px-16 py-8 sm:py-20 flex flex-col gap-5'>
          <b>Quality Assurance</b>
          <p className='text-gray-600'>
            Every product and service we deliver goes through a rigorous quality check to ensure that our customers receive only the best.
          </p>
        </div>
        <div className='border px-10 md:px-16 py-8 sm:py-20 flex flex-col gap-5'>
          <b>Convenience</b>
          <p className='text-gray-600'>
            We focus on making your experience smooth and hassle-free — from browsing to purchase and beyond, everything is designed to save your time.
          </p>
        </div>
        <div className='border px-10 md:px-16 py-8 sm:py-20 flex flex-col gap-5'>
          <b>Exceptional Customer Service</b>
          <p className='text-gray-600'>
            Our support team is always ready to assist you with personalized solutions and timely responses, because your satisfaction is our priority.
          </p>
        </div>
      </div>

      <NewsletterBox/>

    </div>
  )
}

export default About
