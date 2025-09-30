import React from 'react'

const Footer = () => {
    return (
        <div className=" p-10 bg-secondary text-white">
            <div className="flex flex-col sm:grid grid-cols-[3fr_1fr_1fr] gap-14   text-sm">
                <div>
                    <p className="text-xl font-medium mb-5">NovaMart</p>
                    <p className="w-full md:w-2/3 text-gray-300">
                        Lorem ipsum dolor sit amet consectetur adipisicing elit. Consequatur, et.
                    </p>
                </div>
                <div>
                    <p className="text-xl font-medium mb-5">COMPANY</p>
                    <ul className="flex flex-col gap-1 text-gray-300">
                        <li className="hover:text-white cursor-pointer">Home</li>
                        <li className="hover:text-white cursor-pointer">About us</li>
                        <li className="hover:text-white cursor-pointer">Delivery</li>
                        <li className="hover:text-white cursor-pointer">Privacy policy</li>
                    </ul>
                </div>
                <div>
                    <p className="text-xl font-medium mb-5">GET IN TOUCH</p>
                    <ul className="flex flex-col gap-1 text-gray-300">
                        <li>+91 7904074107</li>
                        <li>logapriyanvky@gmail.com</li>
                    </ul>
                </div>
            </div>
            <div>
                <hr className="border-gray-600 mt-10" />
                <p className="py-5 text-sm text-center text-gray-400">
                    Copyright 2025 @ NovaMart - All Rights Reserved
                </p>
            </div>
        </div>
    )
}

export default Footer
