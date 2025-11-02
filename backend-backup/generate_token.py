import jwt
import datetime

# Use the same secret key as in your backend
JWT_SECRET_KEY = "7cc6c33d178bf05c12f0c96e73ba72d69e2c860261d9bcaa"  # replace with your backend secret

payload = {
    "id": "102919639163266291563",
    "email": "kashishsingh2308@gmail.com",
    "name": "Kashish Singh",
    # Token will expire in 1 hour
    "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=1)
}

# Generate token
token = jwt.encode(payload, JWT_SECRET_KEY, algorithm="HS256")
print("Your new token:")
print(token)
