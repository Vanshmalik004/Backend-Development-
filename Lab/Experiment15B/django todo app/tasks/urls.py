from django.urls import path
from . import views

urlpatterns = [
    # The home page displays the task list.
    path('', views.task_list, name='task_list'),

    # The form page creates a new task.
    path('add/', views.add_task, name='add_task'),

    # These routes identify a task by its integer primary key.
    path('toggle/<int:task_id>/', views.toggle_task, name='toggle_task'),
    path('delete/<int:task_id>/', views.delete_task, name='delete_task'),
]
