import BestSeller from "../components/BestSeller.jsx"
import Hero from "../components/Hero"
import LatestCollection from "../components/LatestCollection"
import NewsletterBox from "../components/NewsletterBox.jsx"
import OurPolicy from "../components/OurPolicy.jsx"

const Home = () => {
  return (
    <div className="px-">
      <Hero/>
      <LatestCollection/>
      <BestSeller/>
      <OurPolicy/>
      <NewsletterBox/>
    </div>
  )
}

export default Home
