import { toast } from 'react-toastify';

class ClassService {
  constructor() {
    const { ApperClient } = window.ApperSDK;
    this.apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
    this.tableName = 'class_c';
  }

  async getAll() {
    try {
      const params = {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "name_c"}},
          {"field": {"Name": "subject_c"}},
          {"field": {"Name": "term_c"}},
          {"field": {"Name": "grade_categories_c"}}
        ],
        orderBy: [{"fieldName": "name_c", "sorttype": "ASC"}],
        pagingInfo: {"limit": 100, "offset": 0}
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
        name: record.name_c || record.Name || '',
        subject: record.subject_c || '',
        term: record.term_c || '',
        gradeCategories: record.grade_categories_c ? 
          record.grade_categories_c.split(',').map(cat => cat.trim()) : 
          []
      }));
    } catch (error) {
      console.error("Error fetching classes:", error);
      toast.error("Failed to fetch classes");
      return [];
    }
  }

  async getById(id) {
    try {
      const params = {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "name_c"}},
          {"field": {"Name": "subject_c"}},
          {"field": {"Name": "term_c"}},
          {"field": {"Name": "grade_categories_c"}}
        ]
      };

      const response = await this.apperClient.getRecordById(this.tableName, parseInt(id), params);
      
      if (!response.data) {
        return null;
      }

      const record = response.data;
      return {
        Id: record.Id,
        name: record.name_c || record.Name || '',
        subject: record.subject_c || '',
        term: record.term_c || '',
        gradeCategories: record.grade_categories_c ? 
          record.grade_categories_c.split(',').map(cat => cat.trim()) : 
          []
      };
    } catch (error) {
      console.error(`Error fetching class ${id}:`, error);
      return null;
    }
  }

  async create(classData) {
    try {
      const params = {
        records: [{
          Name: classData.name,
          name_c: classData.name,
          subject_c: classData.subject,
          term_c: classData.term || '',
          grade_categories_c: Array.isArray(classData.gradeCategories) ? 
            classData.gradeCategories.join(',') : 
            classData.gradeCategories || ''
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
      console.error("Error creating class:", error);
      toast.error("Failed to create class");
      return null;
    }
  }

  async update(id, classData) {
    try {
      const params = {
        records: [{
          Id: parseInt(id),
          Name: classData.name,
          name_c: classData.name,
          subject_c: classData.subject,
          term_c: classData.term || '',
          grade_categories_c: Array.isArray(classData.gradeCategories) ? 
            classData.gradeCategories.join(',') : 
            classData.gradeCategories || ''
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
      console.error("Error updating class:", error);
      toast.error("Failed to update class");
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
      console.error("Error deleting class:", error);
      toast.error("Failed to delete class");
      return false;
    }
  }

  transformRecord(record) {
    return {
      Id: record.Id,
      name: record.name_c || record.Name || '',
      subject: record.subject_c || '',
      term: record.term_c || '',
      gradeCategories: record.grade_categories_c ? 
        record.grade_categories_c.split(',').map(cat => cat.trim()) : 
        []
    };
  }
}

export default new ClassService();
export default new ClassService();