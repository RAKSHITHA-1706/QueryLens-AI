from google import genai
from app.config import get_settings

settings = get_settings()

client = genai.Client(api_key=settings.gemini_api_key)

response = client.models.generate_content(
    model="gemini-flash-latest",
    contents="Say hello"
)

print(response.text)