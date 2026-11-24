from django.http import JsonResponse

def index(request):
    return JsonResponse({
        "message": "Welcome to the Student Management API",
        "version": "1.0",
        "status": "running"
    })


def student_list(request):
    return JsonResponse({
        "students": [],
        "message": "Student list endpoint",
    })


def student_detail(request, student_id):
    return JsonResponse({
        "student_id": student_id,
        "message": "Student detail endpoint",
    })
