import { toast } from 'react-toastify';

class AssignmentService {
  constructor() {
    const { ApperClient } = window.ApperSDK;
    this.apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
    this.tableName = 'assignment_c';
  }

  async getAll() {
    try {
      const params = {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "name_c"}},
          {"field": {"Name": "class_id_c"}},
          {"field": {"Name": "category_c"}},
          {"field": {"Name": "max_points_c"}},
          {"field": {"Name": "due_date_c"}},
          {"field": {"Name": "description_c"}}
        ],
        orderBy: [{"fieldName": "due_date_c", "sorttype": "DESC"}],
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
        classId: record.class_id_c?.Id || record.class_id_c,
        category: record.category_c || '',
        maxPoints: record.max_points_c || 0,
        dueDate: record.due_date_c || '',
        description: record.description_c || ''
      }));
    } catch (error) {
      console.error("Error fetching assignments:", error);
      toast.error("Failed to fetch assignments");
      return [];
    }
  }

  async getById(id) {
    try {
      const params = {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "name_c"}},
          {"field": {"Name": "class_id_c"}},
          {"field": {"Name": "category_c"}},
          {"field": {"Name": "max_points_c"}},
          {"field": {"Name": "due_date_c"}},
          {"field": {"Name": "description_c"}}
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
        classId: record.class_id_c?.Id || record.class_id_c,
        category: record.category_c || '',
        maxPoints: record.max_points_c || 0,
        dueDate: record.due_date_c || '',
        description: record.description_c || ''
      };
    } catch (error) {
      console.error(`Error fetching assignment ${id}:`, error);
      return null;
    }
  }

  async create(assignmentData) {
    try {
      const params = {
        records: [{
          Name: assignmentData.name,
          name_c: assignmentData.name,
          class_id_c: assignmentData.classId ? parseInt(assignmentData.classId) : null,
          category_c: assignmentData.category,
          max_points_c: parseInt(assignmentData.maxPoints) || 0,
          due_date_c: assignmentData.dueDate,
          description_c: assignmentData.description || ''
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
      console.error("Error creating assignment:", error);
      toast.error("Failed to create assignment");
      return null;
    }
  }

  async update(id, assignmentData) {
    try {
      const params = {
        records: [{
          Id: parseInt(id),
          Name: assignmentData.name,
          name_c: assignmentData.name,
          class_id_c: assignmentData.classId ? parseInt(assignmentData.classId) : null,
          category_c: assignmentData.category,
          max_points_c: parseInt(assignmentData.maxPoints) || 0,
          due_date_c: assignmentData.dueDate,
          description_c: assignmentData.description || ''
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
      console.error("Error updating assignment:", error);
      toast.error("Failed to update assignment");
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
      console.error("Error deleting assignment:", error);
      toast.error("Failed to delete assignment");
      return false;
    }
  }

  transformRecord(record) {
    return {
      Id: record.Id,
      name: record.name_c || record.Name || '',
      classId: record.class_id_c?.Id || record.class_id_c,
      category: record.category_c || '',
      maxPoints: record.max_points_c || 0,
      dueDate: record.due_date_c || '',
      description: record.description_c || ''
    };
  }
}

export default new AssignmentService();