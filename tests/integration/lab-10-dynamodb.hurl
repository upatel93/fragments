# Step 1: POST a JSON Fragment
# Authenticated POST to /v1/fragments with JSON content
POST http://localhost:8080/v1/fragments
# We're sending a JSON fragment
Content-Type: application/json
# Include HTTP Basic Auth credentials
[BasicAuth]
testuser1:Testu1@2911
# Body of the request goes in ```...``` when it's a string
{"service": "DynamoDB"}

# Step 2: Confirm that the server returns a 201, and capture the Location header value and the fragment's id in variables named fragment1_url and fragment1_id.
HTTP/1.1 201
[Captures]
fragment1_url: header "Location"
fragment1_id: jsonpath "$.fragment.id"

# Step 3: GET the fragment info (i.e., metadata) for the fragment you just created using the 
# Location URL/info as an authorized user and confirm that the server returns a 200 and that all of the metadata properties match what you expect.
GET {{fragment1_url}}/info
[BasicAuth]
testuser1:Testu1@2911

HTTP/1.1 200
[Asserts]
jsonpath "$.status" == "ok"
jsonpath "$.fragment.id" == {{fragment1_id}}
# Our ownerId hash is a hex encoded string
jsonpath "$.fragment.ownerId" matches "^[0-9a-fA-F]+$"
jsonpath "$.fragment.created" isString
jsonpath "$.fragment.updated" isString
jsonpath "$.fragment.type" matches "^application/json(; charset=utf-8)?$"
jsonpath "$.fragment.size" == 23


# Step 4: POST a second Markdown fragment as the same authorized user. 
# The fragment's body should be the Markdown value, DynamoDB is **great**.
POST http://localhost:8080/v1/fragments
Content-Type: text/markdown
[BasicAuth]
testuser1:Testu1@2911

`DynamoDB is **great**.`


# Step 5: Confirm that the server returns a 201, and once again capture 
# the Location header value and the second id in variables named fragment2_url and fragment2_id.
HTTP/1.1 201
[Captures]
fragment2_url: header "Location"
fragment2_id: jsonpath "$.fragment.id"

# Step 6: GET Info for the Second Fragment
GET {{fragment2_url}}/info
[BasicAuth]
testuser1:Testu1@2911

HTTP/1.1 200
[Asserts]
jsonpath "$.status" == "ok"
jsonpath "$.fragment.id" == {{fragment2_id}}
# Our ownerId hash is a hex encoded string
jsonpath "$.fragment.ownerId" matches "^[0-9a-fA-F]+$"
# Basic check for the presence of created and updated date strings.
# You could also write a regex for this and use matches
jsonpath "$.fragment.created" isString
jsonpath "$.fragment.updated" isString
jsonpath "$.fragment.type" matches "text/markdown"
jsonpath "$.fragment.size" == 22


# Step 7: GET all of the fragments for the same authorized user without expanding them 
# (i.e., just get back the IDs) and confirm that the list of fragments includes the two id values you captured above
GET http://localhost:8080/v1/fragments
[BasicAuth]
testuser1:Testu1@2911

HTTP/1.1 200
[Asserts]
jsonpath "$.fragments" includes {{fragment1_id}}
jsonpath "$.fragments" includes {{fragment2_id}}

# Step 8: DELETE the first fragment you created above
DELETE {{fragment1_url}}
[BasicAuth]
testuser1:Testu1@2911

# Step 9: Confirm that the server returns a 200
HTTP/1.1 200

# Step 10: Attempt to GET the Deleted Fragment
GET {{fragment1_url}}/info
[BasicAuth]
testuser1:Testu1@2911

#Step 11: Confirm that the server returns a 404, since the fragment should be deleted.
HTTP/1.1 404


# Step 12: GET all of the fragments for the same authorized user without expanding them 
# (i.e., just get back the IDs) a second time, and confirm that the first id is NOT included but that the second id is
GET http://localhost:8080/v1/fragments
[BasicAuth]
testuser1:Testu1@2911

HTTP/1.1 200
[Asserts]
jsonpath "$.fragments" not includes {{fragment1_id}}
jsonpath "$.fragments" includes {{fragment2_id}}