import { Hono } from "hono";
import authRoutes from "./auth.routes";

const mainRoutes=new Hono()

mainRoutes.route('/auth', authRoutes)
export default mainRoutes