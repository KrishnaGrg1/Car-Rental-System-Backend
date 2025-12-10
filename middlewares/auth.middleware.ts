import type { MiddlewareHandler } from 'hono'
import jwt from 'jsonwebtoken'
import { getCookie } from 'hono/cookie'

import env from '../config/env'
import '../types/hono.d'

interface JwtPayload {
  id: string
  iat: number
  exp: number
}

/**
 * Authentication Middleware
 * Validates JWT token from Bearer header (mobile) or cookie (web)
 * and attaches user ID to request
 */
const authMiddleware: MiddlewareHandler = async (c, next) => {
  let token: string | undefined

  // First, check for Bearer token in Authorization header (mobile clients)
  const authHeader = c.req.header('Authorization')
  if (authHeader?.startsWith('Bearer ')) {
    token = authHeader.substring(7)
  }

  // Fallback to cookie (web clients)
  if (!token) {
    token = getCookie(c, 'access_token')
  }

  if (!token) {
    return c.json({ message: 'Authentication required' }, 401)
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET!) as JwtPayload
    c.req.userId = decoded.id
    await next()
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return c.json({ message: 'Token has expired' }, 401)
    }
    if (error instanceof jwt.JsonWebTokenError) {
      return c.json({ message: 'Invalid token' }, 401)
    }
    return c.json({ message: 'Authentication failed' }, 401)
  }
}

export default authMiddleware
