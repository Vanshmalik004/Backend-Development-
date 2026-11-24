import logging
import time

logger = logging.getLogger(__name__)


class SimpleLoggingMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        start_time = time.perf_counter()
        logger.info("Request: %s %s", request.method, request.get_full_path())

        response = self.get_response(request)

        duration_ms = (time.perf_counter() - start_time) * 1000
        logger.info(
            "Response: %s in %.2f ms",
            response.status_code,
            duration_ms,
        )
        return response
