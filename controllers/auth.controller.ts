import type { Context } from 'hono'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

import { prisma } from '../config/db'
import env from '../config/env'
import '../types/hono.d'
import { setCookie } from 'hono/cookie'

/**
 * Authentication Controller
 * Handles user registration, login, and profile retrieval
 */
class AuthController {
  private readonly SALT_ROUNDS = Number(env.BCRYPT_SALT_ROUNDS)
  private readonly TOKEN_EXPIRY = '7d'

  /**
   * Register a new user
   * @route POST /auth/register
   */
  public registerUser = async (c: Context): Promise<Response> => {
    const { email, name, password } = c.req.validatedBody as {
      email: string
      name: string
      password: string
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    })

    if (existingUser) {
      return c.json({ message: 'User already exists' }, 409)
    }

    const hashedPassword = await bcrypt.hash(password, this.SALT_ROUNDS)

    const user = await prisma.user.create({
      data: { email, name, password: hashedPassword },
      select: { id: true, email: true, name: true, createdAt: true },
    })

    return c.json({ message: 'User registered successfully', data: user }, 201)
  }

  /**
   * Login user and return JWT token
   * @route POST /auth/login
   */
  public loginUser = async (c: Context): Promise<Response> => {
    const { email, password } = c.req.validatedBody as {
      email: string
      password: string
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, name: true, password: true },
    })

    if (!user) {
      return c.json({ message: 'Invalid credentials' }, 401)
    }

    const isValidPassword = await bcrypt.compare(password, user.password)

    if (!isValidPassword) {
      return c.json({ message: 'Invalid credentials' }, 401)
    }

    const token = jwt.sign({ id: user.id }, env.JWT_SECRET!, {
      expiresIn: this.TOKEN_EXPIRY,
    })

    setCookie(c,'access_token',token)
    return c.json({ message: 'Login successful' }, 200)
  }

  /**
   * Get current authenticated user profile
   * @route GET /auth/me
   */
  public getMe = async (c: Context): Promise<Response> => {
    const userId = c.req.userId

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, createdAt: true, updatedAt: true },
    })

    if (!user) {
      return c.json({ message: 'User not found' }, 404)
    }

    return c.json({ message: 'Success', data: user }, 200)
  }
}

export default new AuthController()
