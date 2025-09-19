import classesData from "@/services/mockData/classes.json";

class ClassService {
  constructor() {
    this.data = [...classesData];
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
    const cls = this.data.find(item => item.Id === id);
    return cls ? { ...cls } : null;
  }

  async create(classData) {
    await this.delay();
    const maxId = Math.max(...this.data.map(item => item.Id), 0);
    const newClass = {
      ...classData,
      Id: maxId + 1,
      studentIds: classData.studentIds || []
    };
    this.data.push(newClass);
    return { ...newClass };
  }

  async update(id, classData) {
    await this.delay();
    const index = this.data.findIndex(item => item.Id === id);
    if (index === -1) {
      throw new Error("Class not found");
    }
    
    const updatedClass = {
      ...this.data[index],
      ...classData,
      Id: id
    };
    this.data[index] = updatedClass;
    return { ...updatedClass };
  }

  async delete(id) {
    await this.delay();
    const index = this.data.findIndex(item => item.Id === id);
    if (index === -1) {
      throw new Error("Class not found");
    }
    
    const deletedClass = { ...this.data[index] };
    this.data.splice(index, 1);
    return deletedClass;
  }
}

export default new ClassService();