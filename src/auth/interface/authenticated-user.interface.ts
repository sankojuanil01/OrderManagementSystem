import { UserRole } from "../../users/enum/roles.enum.js";


export interface AuthenticatedUser {
    id : number,
    name : string,
    email : string,
    role : UserRole
}