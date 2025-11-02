import os, requests

API_URL = "https://api-inference.huggingface.co/models/Salesforce/blip-image-captioning-base"
HF_KEY = os.getenv("HUGGINGFACE_API_KEY") 
headers = {"Authorization": f"Bearer {HF_KEY}"}

with open("test.jpg", "rb") as f:
    files = {"file": ("test.jpg", f, "application/octet-stream")}
    r = requests.post(API_URL, headers=headers, files=files, timeout=120)
    print("Status code:", r.status_code)
    print("Response text:", r.text)
