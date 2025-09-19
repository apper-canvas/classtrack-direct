import studentsData from "@/services/mockData/students.json";

class StudentService {
  constructor() {
    this.data = [...studentsData];
  }

  // Simulate API delay
  delay(ms = 300) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async getAll() {
    await this.delay();
    return [...this.data];
  }

  async getById(id) {
    await this.delay();
    const student = this.data.find(item => item.Id === id);
    return student ? { ...student } : null;
  }

  async create(studentData) {
    await this.delay();
    const maxId = Math.max(...this.data.map(item => item.Id), 0);
    const newStudent = {
      ...studentData,
      Id: maxId + 1
    };
    this.data.push(newStudent);
    return { ...newStudent };
  }

  async update(id, studentData) {
    await this.delay();
    const index = this.data.findIndex(item => item.Id === id);
    if (index === -1) {
      throw new Error("Student not found");
    }
    
    const updatedStudent = {
      ...this.data[index],
      ...studentData,
      Id: id
    };
    this.data[index] = updatedStudent;
    return { ...updatedStudent };
  }

  async delete(id) {
    await this.delay();
    const index = this.data.findIndex(item => item.Id === id);
    if (index === -1) {
      throw new Error("Student not found");
    }
    
    const deletedStudent = { ...this.data[index] };
    this.data.splice(index, 1);
    return deletedStudent;
  }
}

export default new StudentService();