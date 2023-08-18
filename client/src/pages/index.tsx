import Image from 'next/image'
import { Inter } from 'next/font/google'
import {GetServerSideProps, InferGetServerSidePropsType, InferGetStaticPropsType, NextPage} from "next"
import { useState } from 'react'
const inter = Inter({ subsets: ['latin'] })

export const getServerSideProps: GetServerSideProps = async(context) => {
  const response = await fetch(process.env.NEXT_PUBLIC_HASURA_PROJECT_ENDPOINT as string, 
    {
      method: 'POST',
      headers:{
        'x-hasura-admin-secret': process.env.HASURA_ADMIN_SECRET as string
      },
      body: JSON.stringify({
        query: `query {
          messages {
            id
            message
            created_at
          }
        }`
      })
  })
  const result = await response.json();

  return {
    props: { messages: await result.data.messages }
  }
}
const handleDelete = async (id: any) => {
  try {
    const response = await fetch(process.env.NEXT_PUBLIC_HASURA_PROJECT_ENDPOINT as string, {
      method: 'POST',
      headers: {
        'x-hasura-admin-secret': "ADh9Ip7eUqMlsbTEsOo1ZHeEksmR2cYI8Uqqak0IWYrtKsKv1bG58xtNgNaUbo1x", 
      },
      body: JSON.stringify({
        query: `
          mutation DeleteMessage($id: Int!) {
            delete_messages(where: { id: { _eq: $id } }) {
              affected_rows
            }
          }
        `,
        variables: {
          id: id,
        },
      }),
    });

    const responseData = await response.json();

    if (responseData.data) {
      window.location.reload();
    } else {
      console.error('Deleting message failed:', responseData.errors);
    }
  } catch (error) {
    console.error('Error deleting message:', error);
  }
};

export default function Home({ messages}:any) {
  const [message, setMsg] = useState("");
  const handleSubmit= async(e:any)=>{
    e.preventDefault();
    try{
      const res = await fetch(process.env.NEXT_PUBLIC_HASURA_PROJECT_ENDPOINT as string,
        {
          method: 'POST',
          headers: {
            'x-hasura-admin-secret': "ADh9Ip7eUqMlsbTEsOo1ZHeEksmR2cYI8Uqqak0IWYrtKsKv1bG58xtNgNaUbo1x",
          },
          body: JSON.stringify({
            query: `mutation InsertMessages($message: String) {
              insert_messages(objects: {message: $message}) {
                affected_rows
              }
            }`,
            variables: {
              message: message
            }
          })
        })
        setMsg("");/* This is to prevent memory leaks */
        window.location.reload();
    }catch(error){
      console.log(error);
      window.alert('Something went wrong :(')
    }
      
  }
  return (
    <main
      className={`flex min-h-screen flex-col items-center justify-between p-24 bg-gray-700`}
    >
      <div className='w-[500px] h-[400px] bg-white border-black border-2 p-2 flex flex-col items-center justify-between'>
       <div className='w-[300px] h-[400px] bg-white border-black flex flex-col items-center justify-between'>
      <div className='flex flex-col items-end w-[500px] p-1 gap-2'>
      {messages.map((message:any) => (
        <div key={message.id} className='flex flex-row gap-2 p-2 border border-black rounded-xl rounded-br-none'>
          <button onClick={()=>handleDelete(message.id)} className='text-black text-[10px]'>Delete</button>
        <p className='text-black text-md max-w-[200px]'>{message.message}</p>
        
        </div>
      ))}
      </div>
      <div className='w-[490px] flex flex-row items-center border'>
        {/** input and a button */}
        <input className='flex flex-1 h-[40px] outline-none p-1 text-black' onChange={(e)=>setMsg(e.target.value)} value={message} placeholder='Say something....'/>
        <button onClick={(e)=>handleSubmit(e)} className='h-[40px] text-black border p-1 hover:bg-red-100 duration-300'>Send</button>
      </div>
      </div>
      </div>
      
    </main>
  )
}
