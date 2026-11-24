import requests


EXTERNAL_API_URL = "https://jsonplaceholder.typicode.com/posts/{post_id}"


def get_external_data(post_id):
    url = EXTERNAL_API_URL.format(post_id=post_id)

    try:
        response = requests.get(url, timeout=2)
        response.raise_for_status()
        return {"data": response.json(), "error": None}
    except requests.Timeout:
        return {"data": None, "error": "External service timed out"}
    except requests.RequestException:
        return {"data": None, "error": "External service is unavailable"}
    except ValueError:
        return {"data": None, "error": "External service returned invalid JSON"}
