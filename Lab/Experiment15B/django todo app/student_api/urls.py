from django.urls import path
from .views import external_data_view

urlpatterns = [
    path(
        'api/students/external/<int:post_id>/',
        external_data_view,
        name='external_data',
    ),
]