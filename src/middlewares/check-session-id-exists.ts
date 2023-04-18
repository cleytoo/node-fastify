import { FastifyRequest, FastifyReply } from 'fastify'

export async function checkSessionIdExists(
  req: FastifyRequest,
  reply: FastifyReply,
) {
  const sessionId = req.cookies.sessionId
  if (!sessionId)
    return reply.status(401).send({
      message: 'Unauthorized',
    })
}
