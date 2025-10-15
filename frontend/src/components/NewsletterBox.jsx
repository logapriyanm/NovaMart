

const NewsletterBox = () => {

  const onSubmitHandler = (event) => {
    event.preventDefault();

  }
  return (
    <div className='text-center pb-5 px-3'>
      <p className='text-2xl font-medium text-gray-800'>Subscribe now & get 20% off</p>
      <p className='text-shadow-gray-400 mt-3 '>  Be the first to know about new arrivals, exclusive deals, and special offers.
        Join our community and enjoy shopping with extra savings!</p>
      <form onSubmit={onSubmitHandler} className='w-full sm:w-1/2 flex items-center gap-3 mx-auto my-6 border pl-3'>
        <input type="email" placeholder='Enter your email' className='w-full sm:flex-1 outline-none' required />
        <button type='submit' className='bg-secondary hover:bg-black cursor-pointer text-white text-xs px-10 py-4'>Subscribe</button>
      </form>
    </div>
  )
}

export default NewsletterBox
