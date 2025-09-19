import assignmentsData from "@/services/mockData/assignments.json";

class AssignmentService {
  constructor() {
    this.data = [...assignmentsData];
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
    const assignment = this.data.find(item => item.Id === id);
    return assignment ? { ...assignment } : null;
  }

  async create(assignmentData) {
    await this.delay();
    const maxId = Math.max(...this.data.map(item => item.Id), 0);
    const newAssignment = {
      ...assignmentData,
      Id: maxId + 1
    };
    this.data.push(newAssignment);
    return { ...newAssignment };
  }

  async update(id, assignmentData) {
    await this.delay();
    const index = this.data.findIndex(item => item.Id === id);
    if (index === -1) {
      throw new Error("Assignment not found");
    }
    
    const updatedAssignment = {
      ...this.data[index],
      ...assignmentData,
      Id: id
    };
    this.data[index] = updatedAssignment;
    return { ...updatedAssignment };
  }

  async delete(id) {
    await this.delay();
    const index = this.data.findIndex(item => item.Id === id);
    if (index === -1) {
      throw new Error("Assignment not found");
    }
    
    const deletedAssignment = { ...this.data[index] };
    this.data.splice(index, 1);
    return deletedAssignment;
  }
}

export default new AssignmentService();