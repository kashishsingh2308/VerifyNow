# app.py
from flask import Flask, request, jsonify
from flask_cors import CORS
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
import google.generativeai as genai
from google.api_core import exceptions as ga_exceptions
import os, jwt, json, datetime, re, time, traceback, tempfile, requests
from jwt import ExpiredSignatureError, InvalidTokenError
from werkzeug.utils import secure_filename
from dotenv import load_dotenv
from supabase import create_client, Client

# -------------------------
# Load environment variables
# -------------------------
load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")

# sanity checks
for key, value in {
    "GEMINI_API_KEY": GEMINI_API_KEY,
    "JWT_SECRET_KEY": JWT_SECRET_KEY,
    "GOOGLE_CLIENT_ID": GOOGLE_CLIENT_ID
}.items():
    if not value:
        raise ValueError(f"{key} not found in environment")

# -------------------------
# Configure APIs
# -------------------------
genai.configure(api_key=GEMINI_API_KEY)



app = Flask(__name__)
CORS(app, 
     supports_credentials=True,
     origins=["https://verify-now-ashy.vercel.app", "http://localhost:3000", "http://localhost:5173"],
     methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
     allow_headers=["Content-Type", "Authorization", "Access-Control-Allow-Credentials"])


# Add this right after CORS configuration
@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', 'https://verify-now-ashy.vercel.app')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    response.headers.add('Access-Control-Allow-Credentials', 'true')
    return response
# -------------------------
# Utility Functions
# -------------------------
def verify_jwt(token):
    try:
        return jwt.decode(token, JWT_SECRET_KEY, algorithms=["HS256"])
    except ExpiredSignatureError:
        print("JWT Token expired")
    except InvalidTokenError:
        print("Invalid JWT Token")
    return None


def call_gemini_working(prompt):
    """Use the working Gemini models we found"""
    working_models = [
        "models/gemini-2.5-pro-preview-03-25",
        "models/gemini-2.5-flash-preview-05-20",
        "gemini-2.5-pro-preview-03-25", 
        "gemini-2.5-flash-preview-05-20"
    ]
    
    for model_name in working_models:
        try:
            print(f"Trying Gemini model: {model_name}")
            model = genai.GenerativeModel(model_name)
            response = model.generate_content(prompt)
            if response.text:
                return response.text
        except Exception as e:
            print(f"Model {model_name} failed: {e}")
            continue
    
    raise Exception("No working Gemini models found")


def check_url_safety(url):
    """Check if a URL is safe using Google Safe Browsing API"""
    api_key = os.getenv("GOOGLE_SAFE_BROWSING_API_KEY")
    if not api_key:
        return {"error": "Safe Browsing API key not configured"}
    
    # Google Safe Browsing API endpoint
    api_url = "https://safebrowsing.googleapis.com/v4/threatMatches:find"
    
    # Request payload
    payload = {
        "client": {
            "clientId": "verifynow-app",
            "clientVersion": "1.0.0"
        },
        "threatInfo": {
            "threatTypes": ["MALWARE", "SOCIAL_ENGINEERING", "UNWANTED_SOFTWARE", "POTENTIALLY_HARMFUL_APPLICATION"],
            "platformTypes": ["ANY_PLATFORM"],
            "threatEntryTypes": ["URL"],
            "threatEntries": [{"url": url}]
        }
    }
    
    try:
        response = requests.post(
            f"{api_url}?key={api_key}",
            json=payload,
            timeout=10
        )
        
        if response.status_code == 200:
            result = response.json()
            
            # If no threats found, URL is safe
            if not result.get('matches'):
                return {
                    "safe": True,
                    "verdict": "Safe",
                    "details": "No security threats detected",
                    "threats": []
                }
            else:
                # Threats found
                threats = []
                for match in result.get('matches', []):
                    threats.append({
                        "threat_type": match.get('threatType', 'Unknown'),
                        "platform": match.get('platformType', 'Unknown'),
                        "url": match.get('threat', {}).get('url', url)
                    })
                
                return {
                    "safe": False,
                    "verdict": "Unsafe",
                    "details": f"Found {len(threats)} security threat(s)",
                    "threats": threats
                }
        else:
            return {
                "error": f"API request failed: {response.status_code}",
                "details": response.text
            }
            
    except Exception as e:
        return {
            "error": f"Safe Browsing check failed: {str(e)}"
        }


def extract_text_from_image(image_path):
    """Extract text from image using OCR"""
    try:
        # Try pytesseract first
        try:
            import pytesseract
            from PIL import Image
            
            # Open and preprocess image for better OCR
            image = Image.open(image_path)
            
            # Convert to RGB if needed
            if image.mode != 'RGB':
                image = image.convert('RGB')
            
            # Use pytesseract to extract text
            text = pytesseract.image_to_string(image)
            
            if text.strip():
                print(f"OCR extracted text: {text.strip()}")
                return text.strip()
                
        except ImportError:
            print("pytesseract not installed")
        except Exception as e:
            print(f"OCR failed: {e}")
        
        # Fallback: Try to describe the image using Gemini Vision
        try:
            print("Trying Gemini Vision as fallback...")
            return describe_image_with_gemini(image_path)
        except Exception as e:
            print(f"Gemini Vision fallback failed: {e}")
        
        return "Unable to extract text from image. Please describe the image content manually."
        
    except Exception as e:
        return f"Error processing image: {str(e)}"


def describe_image_with_gemini(image_path):
    """Use Gemini to describe the image content"""
    try:
        # Use a model that supports vision
        model = genai.GenerativeModel("models/gemini-2.5-flash-preview-05-20")
        
        # Read the image file
        with open(image_path, "rb") as f:
            image_data = f.read()
        
        # Create the image part
        image_part = {
            "mime_type": "image/jpeg",  # Adjust if needed
            "data": image_data
        }
        
        prompt = "Describe this image in detail. Focus on any text, objects, people, or context that could be fact-checked. Be specific about what you see."
        
        response = model.generate_content([prompt, image_part])
        return response.text if hasattr(response, 'text') else "No description generated"
        
    except Exception as e:
        raise Exception(f"Gemini vision failed: {str(e)}")


def save_temp_uploaded_file(file_storage):
    filename = secure_filename(file_storage.filename or "upload")
    tmp = tempfile.NamedTemporaryFile(prefix="verify_", suffix=os.path.splitext(filename)[1], delete=False)
    file_storage.save(tmp.name)
    tmp.close()
    return tmp.name


def extract_json(text):
    """Extract JSON from text response"""
    try:
        # Try to find JSON in the response
        match = re.search(r"```json\s*(\{.*\})\s*```|(\{.*\})", text, re.DOTALL)
        json_text = match.group(1) or match.group(2) if match else text
        
        # Parse JSON
        parsed = json.loads(json_text)
        return parsed
    except Exception:
        # If no valid JSON, create a basic response
        return {
            "verdict": "Unverified",
            "summary": text[:300] + "..." if len(text) > 300 else text,
            "proofs": ["Analysis completed"]
        }


# -------------------------
# Routes
# -------------------------
@app.route("/")
def home():
    return "✅ VerifyNow Flask Backend Running!"


# --- Google Login ---
@app.route("/api/google-login", methods=["POST"])
def google_login():
    token = request.json.get("id_token")
    if not token:
        return jsonify({"message": "Missing ID token"}), 400

    try:
        idinfo = id_token.verify_oauth2_token(token, google_requests.Request(), GOOGLE_CLIENT_ID)

        user_id = idinfo["sub"]
        user_email = idinfo["email"]
        user_name = idinfo.get("name")
        user_picture = idinfo.get("picture")

        exp_time = datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(hours=2)
        payload = {
            "id": user_id,
            "email": user_email,
            "name": user_name,
            "picture": user_picture,
            "exp": exp_time
        }
        app_token = jwt.encode(payload, JWT_SECRET_KEY, algorithm="HS256")
        if isinstance(app_token, bytes):
            app_token = app_token.decode()

        return jsonify({
            "message": "Login success",
            "token": app_token,
            "user": {
                "id": user_id,
                "email": user_email,
                "name": user_name,
                "image": user_picture
            }
        }), 200
    except Exception as e:
        traceback.print_exc()
        return jsonify({"message": f"Login failed: {e}"}), 401


# --- Verify Token ---
@app.route("/api/verify-token", methods=["POST"])
def verify_token():
    token = request.json.get("token")
    if not token:
        return jsonify({"valid": False, "message": "No token provided"}), 400

    try:
        decoded = jwt.decode(token, JWT_SECRET_KEY, algorithms=["HS256"])
        user_data = {
            "id": decoded.get("id"),
            "email": decoded.get("email"),
            "name": decoded.get("name"),
            "image": decoded.get("picture")
        }
        return jsonify({"valid": True, "user": user_data}), 200
    except ExpiredSignatureError:
        return jsonify({"valid": False, "message": "Token expired"}), 401
    except InvalidTokenError:
        return jsonify({"valid": False, "message": "Invalid token"}), 401
    except Exception as e:
        traceback.print_exc()
        return jsonify({"valid": False, "message": f"Token verification failed: {e}"}), 500


# --- Verify Text (Optimized) ---
@app.route("/api/verify-text", methods=["POST"])
def verify_text():
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        return jsonify({"message": "Auth required"}), 401
    user = verify_jwt(auth_header.split(" ")[1])
    if not user:
        return jsonify({"message": "Invalid or expired token"}), 401

    data = request.get_json(silent=True) or {}
    text = data.get("text")
    if not text:
        return jsonify({"message": "No text provided"}), 400

    try:
        # Single API call - no intermediate steps
        prompt = f"""
You are a fact-checking assistant. Analyze this statement and respond ONLY with valid JSON:
{{"verdict":"Real"|"Fake"|"Misleading"|"Unverified","summary":"Brief analysis...","proofs":["Evidence 1","Evidence 2"],"confidence":85}}

Statement: "{text}"
"""
        response = call_gemini_working(prompt)
        parsed = extract_json(response)
        
        # Ensure all required fields are present
        if not parsed.get("verdict"):
            parsed["verdict"] = "Unverified"
        if not parsed.get("summary"):
            parsed["summary"] = "Analysis completed"
        if not parsed.get("proofs"):
            parsed["proofs"] = ["Content analyzed"]
        if not parsed.get("confidence"):
            parsed["confidence"] = 75

        # Save to history (this happens after response is ready)
        history_data = {
            "type": "text",
            "content": text[:200],
            "verdict": parsed["verdict"],
            "summary": parsed["summary"],
            "proofs": parsed["proofs"],
            "confidence": parsed["confidence"]
        }
        save_verification_history(user["id"], history_data)
        
        return jsonify(parsed), 200
        
    except Exception as e:
        traceback.print_exc()
        # Return complete error response immediately
        return jsonify({
            "verdict": "Unverified", 
            "summary": f"Verification failed: {str(e)}",
            "proofs": ["Technical error during analysis"],
            "confidence": 0
        }), 500

# --- Verify Image (Optimized) ---
@app.route("/api/verify-image", methods=["POST"])
def verify_image():
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        return jsonify({"message": "Auth required"}), 401
    user = verify_jwt(auth_header.split(" ")[1])
    if not user:
        return jsonify({"message": "Invalid or expired token"}), 401

    try:
        image_file = request.files.get("image")
        if not image_file:
            return jsonify({"message": "No image uploaded"}), 400

        # Single processing flow
        local_path = save_temp_uploaded_file(image_file)
        
        # Extract text/description (single step)
        image_description = extract_text_from_image(local_path)

        # Analyze with Gemini (single step)
        prompt = f"""
You are a fact-checking assistant. Analyze this image description and respond ONLY with valid JSON:
{{"verdict":"Real"|"Fake"|"Misleading"|"Unverified","summary":"Brief analysis...","proofs":["Evidence 1","Evidence 2"],"confidence":85}}

Image Description: "{image_description}"
"""
        analysis_result = call_gemini_working(prompt)
        parsed_result = extract_json(analysis_result)

        # Ensure complete response
        if not parsed_result.get("verdict"):
            parsed_result["verdict"] = "Unverified"
        if not parsed_result.get("summary"):
            parsed_result["summary"] = "Image analysis completed"
        if not parsed_result.get("proofs"):
            parsed_result["proofs"] = ["Visual content analyzed"]
        if not parsed_result.get("confidence"):
            parsed_result["confidence"] = 75

        # Add context
        parsed_result["image_analysis"] = image_description[:500]

        # Save history
        history_data = {
            "type": "image",
            "content": image_description,
            "verdict": parsed_result["verdict"],
            "summary": parsed_result["summary"],
            "proofs": parsed_result["proofs"],
            "confidence": parsed_result["confidence"]
        }
        save_verification_history(user["id"], history_data)
        
        # Clean up
        if local_path and os.path.exists(local_path):
            os.remove(local_path)

        return jsonify(parsed_result), 200

    except Exception as e:
        # Clean up on error
        if 'local_path' in locals() and local_path and os.path.exists(local_path):
            os.remove(local_path)
            
        return jsonify({
            "verdict": "Unverified", 
            "summary": f"Image verification failed: {str(e)}",
            "proofs": ["Technical error during processing"],
            "confidence": 0
        }), 500

# --- Verify Link (Optimized) ---
@app.route("/api/verify-link", methods=["POST"])
def verify_link():
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        return jsonify({"message": "Auth required"}), 401
    user = verify_jwt(auth_header.split(" ")[1])
    if not user:
        return jsonify({"message": "Invalid or expired token"}), 401

    data = request.get_json(silent=True) or {}
    url = data.get("url")
    
    if not url:
        return jsonify({"message": "No URL provided"}), 400

    if not url.startswith(('http://', 'https://')):
        url = 'https://' + url

    try:
        # Single safety check
        safety_result = check_url_safety(url)
        safety_verdict = "Safe" if safety_result.get("safe") else "Unsafe"

        # Single content analysis
        prompt = f"""
You are a fact-checking assistant. Analyze this URL and respond ONLY with valid JSON:
{{"verdict":"Real"|"Fake"|"Misleading"|"Unverified","summary":"Brief analysis...","proofs":["Evidence 1","Evidence 2"],"confidence":85,"safety_status":"{safety_verdict}"}}

URL: {url}
Safety Status: {safety_verdict}
"""
        gemini_response = call_gemini_working(prompt)
        parsed_result = extract_json(gemini_response)

        # Ensure complete response
        if not parsed_result.get("verdict"):
            parsed_result["verdict"] = "Unverified"
        if not parsed_result.get("summary"):
            parsed_result["summary"] = "URL analysis completed"
        if not parsed_result.get("proofs"):
            parsed_result["proofs"] = ["Domain and safety analyzed"]
        if not parsed_result.get("confidence"):
            parsed_result["confidence"] = 75

        # Add safety info
        parsed_result["safety_check"] = safety_result

        # Save history
        history_data = {
            "type": "link",
            "content": url,
            "verdict": parsed_result["verdict"],
            "summary": parsed_result["summary"],
            "proofs": parsed_result["proofs"],
            "confidence": parsed_result["confidence"],
            "safety_check": safety_result
        }
        save_verification_history(user["id"], history_data)
        
        return jsonify(parsed_result), 200

    except Exception as e:
        return jsonify({
            "verdict": "Unverified", 
            "summary": f"Link verification failed: {str(e)}",
            "proofs": ["Technical error during verification"],
            "confidence": 0,
            "safety_check": {"error": str(e)}
        }), 500


# --- Test Endpoints ---
@app.route("/api/test-gemini", methods=["GET"])
def test_gemini():
    """Test if Gemini is working"""
    try:
        prompt = "Respond with this exact JSON: {'status': 'working', 'message': 'Gemini is functioning correctly'}"
        response = call_gemini_working(prompt)
        return jsonify({
            "status": "success",
            "response": response
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/test-ocr", methods=["POST"])
def test_ocr():
    """Test OCR functionality"""
    try:
        if 'image' not in request.files:
            return jsonify({"error": "No image provided"}), 400
            
        image_file = request.files['image']
        local_path = save_temp_uploaded_file(image_file)
        
        extracted_text = extract_text_from_image(local_path)
        
        # Clean up
        if os.path.exists(local_path):
            os.remove(local_path)
            
        return jsonify({
            "extracted_text": extracted_text,
            "status": "success"
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    

# --- Get Verification History ---
@app.route("/api/verification-history", methods=["GET"])
def get_verification_history():
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        return jsonify({"message": "Auth required"}), 401
    user = verify_jwt(auth_header.split(" ")[1])
    if not user:
        return jsonify({"message": "Invalid or expired token"}), 401

    try:
        limit = request.args.get('limit', 50, type=int)
        history = get_user_verification_history(user["id"], limit)
        
        # Format the response for frontend
        formatted_history = []
        for item in history:
            formatted_history.append({
                "id": item.get("id"),
                "verdict": item.get("verdict"),
                "confidence": item.get("confidence", 0),
                "summary": item.get("summary", ""),
                "createdAt": item.get("created_at"),
                "inputType": item.get("type")
            })
        
        return jsonify(formatted_history), 200
        
    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500
    

def save_verification_history(user_id, verification_data):
    """Save verification result to Supabase"""
    try:
        supabase_url = os.getenv("SUPABASE_URL")
        supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
        
        # Create supabase client
        supabase: Client = create_client(supabase_url, supabase_key)
        
        # Prepare data for insertion
        history_data = {
            "user_id": user_id,
            "type": verification_data.get("type"),
            "content": verification_data.get("content", "")[:500],  # Limit content length
            "verdict": verification_data.get("verdict", "Unverified"),
            "summary": verification_data.get("summary", ""),
            "proofs": verification_data.get("proofs", []),
            "confidence": verification_data.get("confidence", 0),
            "safety_check": verification_data.get("safety_check", {})
        }
        
        # Insert into Supabase
        response = supabase.table("verification_history").insert(history_data).execute()
        
        if hasattr(response, 'data') and response.data:
            print(f"✅ History saved for user {user_id}")
            return True
        else:
            print(f"❌ Failed to save history: {response}")
            return False
            
    except Exception as e:
        print(f"❌ Error saving history: {e}")
        return False

def get_user_verification_history(user_id, limit=50):
    """Get verification history for a user"""
    try:
        supabase_url = os.getenv("SUPABASE_URL")
        supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
        
        # Create supabase client
        supabase: Client = create_client(supabase_url, supabase_key)
        
        # Query user's history, ordered by most recent
        response = supabase.table("verification_history")\
            .select("*")\
            .eq("user_id", user_id)\
            .order("created_at", desc=True)\
            .limit(limit)\
            .execute()
        
        return response.data if hasattr(response, 'data') else []
        
    except Exception as e:
        print(f"❌ Error fetching history: {e}")
        return []


# -------------------------
# Run
# -------------------------
if __name__ == "__main__":
    port = int(os.environ.get('PORT', 10000))
    app.run(host='0.0.0.0', port=port, debug=False)