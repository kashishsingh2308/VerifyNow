import requests
import base64
import os
from dotenv import load_dotenv

# Load your API key from the .env file
load_dotenv()
API_KEY = os.getenv("GOOGLE_VISION_API_KEY")

# Read the test image and convert it to base64
with open("test.jpg", "rb") as image_file:
    encoded_image = base64.b64encode(image_file.read()).decode("utf-8")

# Google Vision API endpoint
url = f"https://vision.googleapis.com/v1/images:annotate?key={API_KEY}"

# Tell the API what to do (detect text)
payload = {
    "requests": [
        {
            "image": {"content": encoded_image},
            "features": [{"type": "TEXT_DETECTION"}]
        }
    ]
}

# Send the image to Google Vision API
response = requests.post(url, json=payload)

# Print the response (should show detected text)
print(response.json())
