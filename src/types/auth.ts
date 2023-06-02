export interface AuthResponse {
    token: string
    first_name: string
    last_name: string
    email: string
}

export interface AuthForm {
    username: string
    password: string
}
