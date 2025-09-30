import React, { useContext } from 'react'
import { ShopContext } from '../context/ShopContext'
import Title from './Title';

const CartTotal = () => {

    const { currency, delivery_fee, getCartAmount } = useContext(ShopContext);

    return (
        <div className='w-full md:p-10 p-5 border border-gray-200 rounded-sm  px-4 '>
            <div className='text-2xl '>
                <Title text1={'Order'} text2={'Summery'} />
            </div>

            <div className='flex flex-col gap-3 mt-2 text-sm'>
                <div className='flex justify-between'>
                    <p>Subtotal</p>
                    <p>{currency} {getCartAmount()}.00</p>
                </div>
                <hr />
                <div className='flex justify-between'>
                    <p>Shipping Fee</p>
                    <p> {currency} {delivery_fee}.00</p>
                </div>
                <hr />
                <div className='flex justify-between'>
                    <b>Total</b>
                    <b>{currency} {getCartAmount() === 0 ? 0 : getCartAmount() + delivery_fee}.00</b>
                </div>

            </div>
        </div>
    )
}

export default CartTotal
