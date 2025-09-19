import { toast } from 'react-toastify';

class GradeService {
  constructor() {
    const { ApperClient } = window.ApperSDK;
    this.apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
    this.tableName = 'grade_c';
  }

  async getAll() {
    try {
      const params = {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "assignment_name_c"}},
          {"field": {"Name": "category_c"}},
          {"field": {"Name": "points_c"}},
          {"field": {"Name": "max_points_c"}},
          {"field": {"Name": "date_c"}},
          {"field": {"Name": "notes_c"}},
          {"field": {"Name": "student_id_c"}},
          {"field": {"Name": "class_id_c"}}
        ],
        orderBy: [{"fieldName": "date_c", "sorttype": "DESC"}],
        pagingInfo: {"limit": 200, "offset": 0}
      };

      const response = await this.apperClient.fetchRecords(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return [];
      }

      // Transform data to match expected format
      return (response.data || []).map(record => ({
        Id: record.Id,
        assignmentName: record.assignment_name_c || record.Name || '',
        category: record.category_c || '',
        points: record.points_c || 0,
        maxPoints: record.max_points_c || 0,
        date: record.date_c || '',
        notes: record.notes_c || '',
        studentId: record.student_id_c?.Id || record.student_id_c,
        classId: record.class_id_c?.Id || record.class_id_c
      }));
    } catch (error) {
      console.error("Error fetching grades:", error);
      toast.error("Failed to fetch grades");
      return [];
    }
  }

  async getById(id) {
    try {
      const params = {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "assignment_name_c"}},
          {"field": {"Name": "category_c"}},
          {"field": {"Name": "points_c"}},
          {"field": {"Name": "max_points_c"}},
          {"field": {"Name": "date_c"}},
          {"field": {"Name": "notes_c"}},
          {"field": {"Name": "student_id_c"}},
          {"field": {"Name": "class_id_c"}}
        ]
      };

      const response = await this.apperClient.getRecordById(this.tableName, parseInt(id), params);
      
      if (!response.data) {
        return null;
      }

      const record = response.data;
      return {
        Id: record.Id,
        assignmentName: record.assignment_name_c || record.Name || '',
        category: record.category_c || '',
        points: record.points_c || 0,
        maxPoints: record.max_points_c || 0,
        date: record.date_c || '',
        notes: record.notes_c || '',
        studentId: record.student_id_c?.Id || record.student_id_c,
        classId: record.class_id_c?.Id || record.class_id_c
      };
    } catch (error) {
      console.error(`Error fetching grade ${id}:`, error);
      return null;
    }
  }

  async create(gradeData) {
    try {
      const params = {
        records: [{
          Name: gradeData.assignmentName,
          assignment_name_c: gradeData.assignmentName,
          category_c: gradeData.category,
          points_c: parseInt(gradeData.points) || 0,
          max_points_c: parseInt(gradeData.maxPoints) || 0,
          date_c: gradeData.date,
          notes_c: gradeData.notes || '',
          student_id_c: gradeData.studentId ? parseInt(gradeData.studentId) : null,
          class_id_c: gradeData.classId ? parseInt(gradeData.classId) : null
        }]
      };

      const response = await this.apperClient.createRecord(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return null;
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to create ${failed.length} records:`, JSON.stringify(failed));
          failed.forEach(record => {
            if (record.message) toast.error(record.message);
          });
        }
        
        if (successful.length > 0) {
          return this.transformRecord(successful[0].data);
        }
      }
      return null;
    } catch (error) {
      console.error("Error creating grade:", error);
      toast.error("Failed to create grade");
      return null;
    }
  }

  async update(id, gradeData) {
    try {
      const params = {
        records: [{
          Id: parseInt(id),
          Name: gradeData.assignmentName,
          assignment_name_c: gradeData.assignmentName,
          category_c: gradeData.category,
          points_c: parseInt(gradeData.points) || 0,
          max_points_c: parseInt(gradeData.maxPoints) || 0,
          date_c: gradeData.date,
          notes_c: gradeData.notes || '',
          student_id_c: gradeData.studentId ? parseInt(gradeData.studentId) : null,
          class_id_c: gradeData.classId ? parseInt(gradeData.classId) : null
        }]
      };

      const response = await this.apperClient.updateRecord(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return null;
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to update ${failed.length} records:`, JSON.stringify(failed));
          failed.forEach(record => {
            if (record.message) toast.error(record.message);
          });
        }
        
        if (successful.length > 0) {
          return this.transformRecord(successful[0].data);
        }
      }
      return null;
    } catch (error) {
      console.error("Error updating grade:", error);
      toast.error("Failed to update grade");
      return null;
    }
  }

  async delete(id) {
    try {
      const params = { 
        RecordIds: [parseInt(id)]
      };

      const response = await this.apperClient.deleteRecord(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return false;
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to delete ${failed.length} records:`, JSON.stringify(failed));
          failed.forEach(record => {
            if (record.message) toast.error(record.message);
          });
        }
        return successful.length > 0;
      }
      return true;
    } catch (error) {
      console.error("Error deleting grade:", error);
      toast.error("Failed to delete grade");
      return false;
    }
  }

  async getAvailableCategories() {
    try {
      const grades = await this.getAll();
      const categories = [...new Set(grades.map(grade => grade.category))].filter(Boolean);
      return categories.sort();
    } catch (error) {
      console.error("Error fetching categories:", error);
      return [];
    }
  }

  transformRecord(record) {
    return {
      Id: record.Id,
      assignmentName: record.assignment_name_c || record.Name || '',
      category: record.category_c || '',
      points: record.points_c || 0,
      maxPoints: record.max_points_c || 0,
      date: record.date_c || '',
      notes: record.notes_c || '',
      studentId: record.student_id_c?.Id || record.student_id_c,
      classId: record.class_id_c?.Id || record.class_id_c
    };
  }
}

export default new GradeService();