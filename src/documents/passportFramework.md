## Passport :
> is an authentication middleware for node.js applications 

> passport.js provides a standard framework for authenticating user using different authentication strategies 

> passport helps organize and execute the authentication through reusable strategies 

> passport.js is noy build into the nestjs core framework
> nestjs provides an official integration package called @nestjs/passport 

- passport  : core passport.js authentication framework
- @nestjs/passport  :  nestjs integration with passport
- passport-jwt  : passport strategy for jwt authentication 

> @nestjs/jwt to generate and verify JWTs using Nestjs 

- imp : Passport is not itself a token-generation library it provides the authentication strategy framework 
> jwt creation and signing are handled seperately

## authentication strategies in passport :
> A strategy is a mechanism that tells passport how to authenticate a user 

> different applications have different authentication requirements 

## Local strategy :
> the local strategy is an authentication strategy provided by passport-local package 
> it allows users to log in using credentials such as email and password 

- {
  "email": "customer@gmail.com",
  "password": "MyPassword123"
}

> the local strategies takes these credentials and verifies wheather the user exists and wheather the passport is correct 

> local strategy does not automatically connect to your database or verify passwords we implement that verification logic in our application 

> passport provides the authentication mechanism and you provide the user lookup and password-validation 

## local authenticatio flow :

user login
- customers email and password 
|
auth controller 
- recieves request and invokes AuthGuard('local')
|
Local Strategy
- extracts email and password from the request
|
Validate User
- calls Validate() method to verify credentials 
|
AuthService 
- find user in postgres
- checks whether the account is active
- compares submitted password with the stored password hash 
|
User object is attached to 
- request.user 
|
authentication Service generates JWT
- if authentication succeds your application generates access and refresh tokens 

> It is an external authentication framework that we integrate with NestJs 

> here Authenticates using email/username and password 
> used during login
> reads credentials from request body 
> checks passwords against stored hash through application logic
> returns authenticated user 


## local strategy is linked with jwt stratgey can you explain it :

> local strategy and jwt strategy are connected as a part of the authentication workflow 
> but they are two independent passport strategies 
> they work together to implement authentication 


## JWT Strategy :
> JWT Strategy is responsible for authenticationg incomming http requests by validating the jwt access token provided by client 

> JWT stands for JSON web Token
> A JWT is a digitally signed token that carries information about an authenticated user 

> for example, after successfully logging in application generates tokens 

> JWT Strategy is the Passport strategy that knows how to extract this token from an incomming request, verify its signature and expiration and identify the authenticated user 

## JWT Strategy : 
> the authentication mechanism that validates the token
## JWT Guard :
> the mechanism that invokes the strategy during request processing 
## JWT Service :
> the service that can generate and sign tokens 

## why do we need JWT Strategy :
> imagine a user logs into OMS 
> the user sends email an password 
> the local Strategy can validate the credentials 
> The Auth Service generates access and refresh tokens 
> the client recieves both tokens 

## JWT Strategy implementation :
> PassportStrategy integrates Passport authentication with nestjs 
> Strategy refers to the JWT strategy provided by passport-jwt 

## jwtFromRequest :  
> ExtractJwt.fromAuthHeaderASBearerToken()
> this tells passport to find the JWT token 
> passport extract token from the request body 

## ignoreExpiration :
> this tells the strategy to reject expired tokens 

## secretOrKey :
> this is the secret key used to verify the token's signature 

> if someOne modifies token payload :
- original 
{
  "role": "USER"
}

- modified :
{
  "role": "ADMIN"
}

> the attcker cannot create a valid signature for the modified payload without signing secret 

> jwt verification detects the invalid signature and rejects the request 

> JWT payloads are encoded anyone token can generally decode the read its payload

> if verification succeds passport calls validate(payload)
>  the object returned by validate() is attached to request.user 

## here why should we use JWT Authentication :
> the OMS has two users USER,ADMIN 
> the backend verifies the credentials and confirms that the user is authenticated 

## jwt authentication :
> user logs in
> backend verifies credentials 
> bacjend generates a signed JWT
> client recieves the token
> client sends the token with subsequent API request
> Backend verifies the token's signature and expiration 

## main reason :

# stateless authentication :
> suppose 1,000 users are accessing our order management system 
> with traditional server-side sessions, the application needs to maintain session information for those users 

> with JWT the backend can validate signed tokens idenpendently without looking up a session for every request 

> the backend verifies the token and obtains the user identity

> it doesn't need to retrieve a session record just to authenticate that request 

## explanation :
> we selected JWT because it supports stateless authentication 
> the server can validate incomming request using token's signature and claim's without maintaing a server-side for every authenticated user 
> this reduces session- management 

> jwt is useful in scalable applications because multiple application instances can independently verify the same token 

> the jwt works naturally with APIs because the client can attach access token to each request 

> the browser doesn't need to maintain a browser login session for each API client 

> this is particularly useful when the backend supports :
- web applications
- mobile applications
- external API consumers
- other backend services 

## authentication and authorization :
> jwt can carry the user's role as a claim 

{
  "sub": "user-123",
  "email": "user@example.com",
  "role": "ADMIN"
}

>  after validating the token the jwt strategy makes the relevant user information available to the application 

## reduce session management :
> in session based authentication 
- session creation
- session storage
- session expiration
- session deletion
- session sharing b/w multiple servers
- session cleanup 

> with JWT access tokens you can verify the token locally without maintaing an server-side session for every user 

## jwt introduces :
- token expiration
- refresh token management
- token revokation
- secure token storage
- secret/key rotation 

## diff b/w session and jwt authentication :

# session authentication :
> state stored in server-side 
> client storage HttpOnly secure cookie
> server matches the cookie's session ID the session store on every request 
> deleting the session from server store immediately logs out the user logout 

## jwt authentication :
> client-side (Token payload contains the user data)
> localStorage, sessionStorage or cookies 
> server verifies the cryptographic signature of the incomming token using a secret key 
> tokens remain valid until they expire

## OAuth Strategy :
> OAuth allows an application to obtain limited access to resources through an external identity or authorization provider without directly handling that provider's user password 

> instead of asking users to create a seperate password for OMS , you allow them to authenticate through google 

> the user authenticates with google, and google provides an authorization response that you are backend can use to establish the user's identity and login session 

> OAuth 2.0 is primarily an authentication framework 

> instead of making users create another password , you allow google to authenticate them 

> for eg :
- user clicks continue with google
- your application redirects the user to google 
- google authenticates the user
- google redirects the user back to your application 
- backend validates the authentication response 
- your application identifies the user and creates its own login credentials or tokens 

> the application doesn't need to collect the user's google password 
> this is the main purpose of external-provider authentication 


## google login flow :

user clicks continue with google
|
redirect to google
- authorization request with client ID and requested scopes
|
google authenticates the user
- users signs in using their google account
|
google redirects back to OMS
- authorization code returned to callback url
|
backend exchanges authorization code
- uses client credentials and redirect url
|
backend validates identity
- validates the OIDC id token and its claims
|
oms identifies or creates its local user
- issuess its own access and refresh tokens 

## can we combine OAuth, JWT and local strategy :

> imagine OMS supports two types of login :
- email/password login
- google login

## combined authentication architecture :

> Email + password  = Local Strategy

> Google Login  = OAuth/OIDC strategy 

> AuthService  = find or create local user and check account status 

> generate OMS access and refresh tokens 

> the Local Strategy and OAuth Strategy are used to establish the initial login where as jwt strategy is used to authenticate subsequent API requests 

## why should we use OAuth instead of local or jwt :
> suppose company wants employees to access the order Management system using their company workspace accounts 

## with external identity authentication :
> employees use their existing company accounts 
> google handles the authentication process
> you application recieves verified identity information 
> you application creates its own authenticated user and permissions 

## does OAuth store the user's password in our database :
> no the user authenticates with the external identity provider
> our application recieves the provider's authorization response and can store the user's provider identity and local account information 
> it doesn't need to store the external account password 