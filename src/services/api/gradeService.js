import gradesData from "@/services/mockData/grades.json";

class GradeService {
  constructor() {
    this.data = [...gradesData];
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
    const grade = this.data.find(item => item.Id === id);
    return grade ? { ...grade } : null;
  }

  async create(gradeData) {
    await this.delay();
    const maxId = Math.max(...this.data.map(item => item.Id), 0);
    const newGrade = {
      ...gradeData,
      Id: maxId + 1
    };
    this.data.push(newGrade);
    return { ...newGrade };
  }

  async update(id, gradeData) {
    await this.delay();
    const index = this.data.findIndex(item => item.Id === id);
    if (index === -1) {
      throw new Error("Grade not found");
    }
    
    const updatedGrade = {
      ...this.data[index],
      ...gradeData,
      Id: id
    };
    this.data[index] = updatedGrade;
    return { ...updatedGrade };
  }

  async delete(id) {
    await this.delay();
    const index = this.data.findIndex(item => item.Id === id);
    if (index === -1) {
      throw new Error("Grade not found");
    }
    
    const deletedGrade = { ...this.data[index] };
    this.data.splice(index, 1);
    return deletedGrade;
  }
}

export default new GradeService();