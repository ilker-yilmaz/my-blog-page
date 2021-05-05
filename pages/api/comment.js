import { nanoid } from 'nanoid'
import Redis from 'ioredis'
import Boom from '@hapi/boom'

function errorResponse(res, error){
  const { output } = error
  return res.status(output.statusCode).json(error.output.payload)

}

export default async function handler(req, res) {

  // CREATE
  if (req.method === 'POST') {
    const { url, userToken, text } = req.body


    if (!url || !userToken || !text){
      return errorResponse(res,Boom.badData("parametre eksik"))
    }


    const userResponse = await fetch(
      `https://${process.env.NEXT_PUBLIC_AUTH0_DOMAIN}/userinfo`,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userToken}`
        }
      }
    )
    const user = await userResponse.json()


    const comment = {
      id: nanoid(),
      createdAt: Date.now(),
      text,
      user: {
        name: user.name,
        picture: user.picture
      }
    }


    //redis connection
    let redis = new Redis(process.env.REDIS_URL)

    //redis write
    redis.lpush(url,JSON.stringify(comment))
    //redis quite
    redis.quit()
    //response
    res.status(200).json(comment)
  }

  //FETCH
  if (req.method === 'GET') {

    const {url}=req.query
    //redis connection
    let redis = new Redis(process.env.REDIS_URL)

    //redis write
    const comments =await redis.lrange(url,0,-1)
    //redis quite
    redis.quit()

    const data = comments.map(e=>JSON.parse(e))

    res.status(200).json(data)
  }


}
