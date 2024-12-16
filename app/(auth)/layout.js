import React, { Children } from 'react'

const AuthLayout = ({Children}) => {
  return (
    <div className='flex justify-center pt-40'>{Children}</div>
  )
}

export default AuthLayout