# 1.  POST a new text fragment to http://localhost:8080 as an authorized user. The fragment's body should be the string, Hello S3!
# Authenticated POST to /v1/fragments with Content-Type 'text/plain'
POST http://localhost:8080/v1/fragments
# We're sending a plain text fragment
Content-Type: text/plain
# Include HTTP Basic Auth credentials
[BasicAuth]
testuser1:Testu1@2911
# Body of the request goes in ```...``` when it's a string
`Hello S3!`

# 2. Confirm that the server returns a 201, and capture the Location header value to a variable named url
HTTP/1.1 201
[Captures]
url: header "Location"

# 3. GET the fragment you just created using the url as an authorized user.
GET {{url}}
[BasicAuth]
testuser1:Testu1@2911

# 4. Confirm that the server returns a 200, that the type of the fragment is text/plain, and that the body is equal to Hello S3!
HTTP/1.1 200
Content-Type: text/plain; charset=utf-8
[Asserts]
body == "Hello S3!"

# 5. DELETE the fragment using the url as an authorized user.
DELETE {{url}}
[BasicAuth]
testuser1:Testu1@2911

# 6. Confirm that the server returns a 200.
HTTP/1.1 200

# 7. GET the fragment you just created using the url as an authorized user.
GET {{url}}
[BasicAuth]
testuser1:Testu1@2911

# 8. Confirm that the server returns a 200, that the type of the fragment is text/plain, and that the body is equal to Hello S3!
HTTP/1.1 404
