
## SHA-256 :
> is a cryptographic one-way hash function 

> it converts the original refresh token into a fixed length hash 256 
> here SHA-256 is one-way you cannot practically reverse the hash to recover the original token 

> SHA-256 produces a fixed length of 256 bits
> one-way hashing : the original token cannot practically be recovered from the hash
> fast computation
> supported directly by Node.js through its built-in crypto module 

## bcrypt :
> passwords should be stored using bcrypt hashing instead of plain text because passwords are sensitive credentials 
> if someone gains access to your database we don't want them to see the actual user passwords 

> when the user logs in you don't decrypt the hash you compare the submitted password against the stored hash 
> if it matches authentications succeds 

## why bcrypt particularly :

# one-way hashing :
> you cannot reverse the hash to recover the original password 

# automatic salting :
> bcrypt generates a random salt for each password 

for eg :
- even if two users have the same password their stored hashes will be different 

## easy integration with Nestjs :
> you can use the bcrypt directly inside AuthService 
> here we never decrypt the password hash 

## when compared to other :
> here when compared to Argon2id and scrypt 

- bcrypt is a strong password security
- it is automatic unique salt
- No memory-hard

# memory-hard mean :
> memory-hard means an algorithm requires a significant amount of computer memeory(RAM) while performing calculation 

> a normal fast hashing algorithm mainly performs calculations

> the attcker cannot simply perform unlimited password guesses each attempt consumes memory as well as processing power 

## here when compared to SHA-256 :
> with SHA-256 each guess is very fast 
- the algorithm is very fast the attacker can perform many guesses in a short time 

> this makes SHA-256 is designed to calculate this makes it unsuitable for password storage 


## passwords :
> usually created by humans 
> attackers can guess common passwords

## refresh tokens :
> should be generated using cryptographically secure randomness
> should have high entrophy
> are not human-created wodrs or phrases
> can be hashed efficiently with SHA-256


> i choose SHA-256 because it provides strong cryptographic hashing with 256-bit output and good perfomance 

> SHA-512 is also secure but SHA-256 already provides sufficient protection for cryptographically random refresh tokens 

## difference b/w HMAC-SHA-256  and SHA-256 :

> SHA-256 creates a hash using the input data alone 

- it takes input data and produces a fixed-length hash of 256 bits 
- no secret key is required
- the same input always produces the same hash
- it is a one-way hash function you cannot practically reverse it to retrieve original input 

> HMAC-SHA-256 : Hash based  message authentication code 

- A hash algorith 
- a scret key shared b/w the parties 
- the same message and same secret key produce the same HMAC
- changing the message or secret key changes the output 