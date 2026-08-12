"""
QueryLens AI — Gemini Service

Reusable client for Google Gemini API.
All LLM calls in the application route through this module.
"""

import logging
from google import genai
from google.genai import errors as genai_errors

from app.config import get_settings

logger = logging.getLogger(__name__)


def _get_client() -> genai.Client:
    """Build and return a Gemini API client using the configured API key."""
    settings = get_settings()
    if not settings.gemini_api_key:
        raise ValueError(
            "GEMINI_API_KEY is not configured. "
            "Set it in your .env file or environment variables."
        )
    return genai.Client(api_key=settings.gemini_api_key)


def generate_text(prompt: str) -> str:
    """
    Send a prompt to Gemini and return the generated text.

    Args:
        prompt: The full prompt string to send to the model.

    Returns:
        The raw text content from the model's response.

    Raises:
        ValueError: If the API key is missing or the response is empty.
        RuntimeError: For Gemini API errors (quota, auth, network, etc.).
    """
    settings = get_settings()
    client = _get_client()

    try:
        response = client.models.generate_content(
            model=settings.gemini_model,
            contents=prompt,
        )

        # Extract text from the response
        text = response.text
        if not text or not text.strip():
            raise ValueError("Gemini returned an empty response.")

        return text.strip()

    except genai_errors.ClientError as e:
        status = getattr(e, "status_code", None)
        if status == 401 or status == 403:
            logger.error(f"Gemini authentication error: {e}")
            raise RuntimeError("Invalid or unauthorized Gemini API key.") from e
        if status == 429:
            logger.error(f"Gemini quota exceeded: {e}")
            raise RuntimeError("Gemini API quota exceeded. Please try again later.") from e
        logger.error(f"Gemini client error: {e}")
        raise RuntimeError(f"Gemini API error: {e}") from e

    except genai_errors.ServerError as e:
        logger.error(f"Gemini server error: {e}")
        raise RuntimeError("Gemini API is temporarily unavailable. Please try again.") from e

    except TimeoutError as e:
        logger.error(f"Gemini request timed out: {e}")
        raise RuntimeError("Request to Gemini API timed out.") from e

    except Exception as e:
        logger.error(f"Unexpected error calling Gemini API: {e}")
        raise RuntimeError(f"Failed to call Gemini API: {e}") from e
