
from django.db import models


class Task(models.Model):
    # Store the short description entered by the user.
    title = models.CharField(max_length=200)

    # New tasks are incomplete unless explicitly changed.
    completed = models.BooleanField(default=False)

    # Django records the creation time when the row is first saved.
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        # Use the task title in the admin site and object representations.
        return self.title

