# Self-service site generator



export TOKEN='EDS_TOKEN_HERE'
export ORG=cpilsworth
export PROFILE=oneaz


curl --request POST \
  --url "https://admin.hlx.page/config/${ORG}/profiles/${PROFILE}/access.json" \
  --header "x-auth-token: ${TOKEN}" \
  --header "Content-Type: application/json" \
  --data '{
    "admin": {
      "role": {
        "config_admin": [
          "chrisp@adobe.com"
        ],
        "admin": [
          "chrisp@adobe.com"
        ],
        "author": [
          "chrisp@adobe.com"
        ],
        "publish": [
          "chrisp@adobe.com"
        ],
        "develop": [],
        "config": []
      }
    }
  }'
