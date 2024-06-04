import fastifyCors from '@fastify/cors'
import fastifyJwt from '@fastify/jwt'
import fastifySwagger from '@fastify/swagger'
import fastifySwaggerUI from '@fastify/swagger-ui'
import { env } from '@saas/env'
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

/** Set type provider */
app.setSerializerCompiler(serializerCompiler)
app.setValidatorCompiler(validatorCompiler)

/** Set custom error handler */
app.setErrorHandler(errorHandler)

/** Set Swagger config and interface */
app.register(fastifySwagger, {
  openapi: {
    info: {
      title: 'SaaS',
      description: 'Full-stack SaaS app with multi-tennant & RBAC.',
      version: '1.0.0',
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  transform: jsonSchemaTransform,
})
app.register(fastifySwaggerUI, {
  routePrefix: '/docs',
})

/** Set others fastify plugins */
app.register(fastifyJwt, { secret: env.JWT_SECRET })
app.register(fastifyCors)

/** Connect API routes */
app.register(routes)

app
  .listen({ port: env.SERVER_PORT })
  .then(() => console.log(`App running on port ${env.SERVER_PORT}`))
