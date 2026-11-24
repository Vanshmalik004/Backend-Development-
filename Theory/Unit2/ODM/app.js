const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect('mongodb://localhost/student_management');

// Define schema
const studentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    branch: {
        type: String,
        enum: ['CSE', 'ECE', 'IT', 'ME', 'CE']
    },
    enrollmentDate: {
        type: Date,
        default: Date.now
    },
    courses: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course'
    }]
});

// Create model
const Student = mongoose.model('Student', studentSchema);

// CRUD Operations
async function createStudent() {
    const student = new Student({
        name: 'Aarav',
        email: 'aarav@upes.ac.in',
        branch: 'CSE',
        courses: ['courseId1', 'courseId2']
    });
    await student.save();
}

async function findStudents() {
    const cseStudents = await Student.find({ branch: 'CSE' });
    const student = await Student.findById('studentId');
}

async function updateStudent() {
    await Student.findByIdAndUpdate('studentId', { branch: 'ECE' });
}

async function deleteStudent() {
    await Student.findByIdAndDelete('studentId');
}
