# How to Design a URL Shortener
### An Interview Process I Learn

---

### 2 features
1. Shortener
2. redirect to long URL

Additional features

3. custom URL
4. remove short URL if not been used for a long time

## Server Side

2 important services (functions)

1. encode(long_URL)
2. decode(short_URL)

When designing encode function, we can...

1. Hash the link and get the last 6 or 10 characters
- It is fast, but it could have repeated link

2. Random number or character generation
- It is easy, but it will need O(n) to search for duplicates

3. use Base 32 to encode
- Fast, based on the increment primary key


## How to Design the storage

### use NoSQL?

- NoSQL because there is no transaction
- no complex SQL query
- not too much QPS
- don't need a lot of machine to support scaling

### use SQL
- less coding than NoSQL
- easier to get started


## Consistent hashing






## How to make this better, faster
- use cache
- use different server for different locations