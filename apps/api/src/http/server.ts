import fastifyCors from '@fastify/cors'
import fastifyJwt from '@fastify/jwt'
import fastifySwagger from '@fastify/swagger'
import fastifySwaggerUI from '@fastify/swagger-ui'
import { fastify } from 'fastify'
import {
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
  ZodTypeProvider,
} from 'fastify-type-provider-zod'

import { routes } from './routes'
import { errorHandler } from './routes/error-handler'

const app = fastify().withTypeProvider<ZodTypeProvider>()

app.setSerializerCompiler(serializerCompiler)
app.setValidatorCompiler(validatorCompiler)

app.setErrorHandler(errorHandler)

app.register(fastifySwagger, {
  openapi: {
    info: {
      title: 'SaaS',
      description: 'Full-stack SaaS app with multi-tennant & RBAC.',
      version: '1.0.0',
    },
    servers: [],
  },
  transform: jsonSchemaTransform,
})
app.register(fastifyJwt, { secret: 'my-jwt-secret' })
app.register(fastifySwaggerUI, {
  routePrefix: '/docs',
})
app.register(fastifyCors)

app.register(routes)

app.listen({ port: 3333 }).then(() => console.log(`App running on port 3333`))
