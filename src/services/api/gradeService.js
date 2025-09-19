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

  async filterByDateRange(startDate, endDate) {
    await this.delay();
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;
    
    return this.data.filter(grade => {
      const gradeDate = new Date(grade.date);
      if (start && end) {
        return gradeDate >= start && gradeDate <= end;
      } else if (start) {
        return gradeDate >= start;
      } else if (end) {
        return gradeDate <= end;
      }
      return true;
    }).map(grade => ({ ...grade }));
  }

  async filterByGradeThreshold(threshold) {
    await this.delay();
    const { min = 0, max = 100, type = "all" } = threshold;
    
    if (type === "all") {
      return [...this.data];
    }
    
    return this.data.filter(grade => {
      const percentage = (grade.points / grade.maxPoints) * 100;
      
      if (type === "above") {
        return percentage >= min;
      } else if (type === "below") {
        return percentage <= max;
      } else if (type === "between") {
        return percentage >= min && percentage <= max;
      }
      return true;
    }).map(grade => ({ ...grade }));
  }

  async getAvailableCategories() {
    await this.delay();
    const categories = [...new Set(this.data.map(grade => grade.category))];
    return categories.sort();
  }

  async getGradesByDateRange(startDate, endDate) {
    await this.delay();
    return this.filterByDateRange(startDate, endDate);
  }

  async getGradesByThreshold(threshold) {
    await this.delay();
    return this.filterByGradeThreshold(threshold);
  }
}

export default new GradeService();