import { toast } from 'react-toastify';

class StudentService {
  constructor() {
    const { ApperClient } = window.ApperSDK;
    this.apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
    this.tableName = 'student_c';
  }

  async getAll() {
    try {
      const params = {
fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "id_c"}},
          {"field": {"Name": "name_c"}},
          {"field": {"Name": "email_c"}},
          {"field": {"Name": "phone_c"}},
          {"field": {"Name": "enrollment_date_c"}},
          {"field": {"Name": "photo_c"}},
          {"field": {"Name": "parent_contact_name_c"}},
          {"field": {"Name": "parent_contact_email_c"}},
          {"field": {"Name": "parent_contact_phone_c"}},
          {"field": {"Name": "class_id_c"}},
          {"field": {"Name": "science_marks_c"}}
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
        id: record.id_c || '',
        name: record.name_c || record.Name || '',
        email: record.email_c || '',
        phone: record.phone_c || '',
        classId: record.class_id_c?.Id || record.class_id_c,
        enrollmentDate: record.enrollment_date_c || '',
        photo: record.photo_c || '',
        scienceMarks: record.science_marks_c || '',
        parentContact: {
          name: record.parent_contact_name_c || '',
          email: record.parent_contact_email_c || '',
          phone: record.parent_contact_phone_c || ''
        }
      }));
    } catch (error) {
      console.error("Error fetching students:", error);
      toast.error("Failed to fetch students");
      return [];
    }
  }

  async getById(id) {
    try {
      const params = {
fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "id_c"}},
          {"field": {"Name": "name_c"}},
          {"field": {"Name": "email_c"}},
          {"field": {"Name": "phone_c"}},
          {"field": {"Name": "enrollment_date_c"}},
          {"field": {"Name": "photo_c"}},
          {"field": {"Name": "parent_contact_name_c"}},
          {"field": {"Name": "parent_contact_email_c"}},
          {"field": {"Name": "parent_contact_phone_c"}},
          {"field": {"Name": "class_id_c"}},
          {"field": {"Name": "science_marks_c"}}
        ]
      };

      const response = await this.apperClient.getRecordById(this.tableName, parseInt(id), params);
      
      if (!response.data) {
        return null;
      }

      const record = response.data;
      return {
Id: record.Id,
        id: record.id_c || '',
        name: record.name_c || record.Name || '',
        email: record.email_c || '',
        phone: record.phone_c || '',
        classId: record.class_id_c?.Id || record.class_id_c,
        enrollmentDate: record.enrollment_date_c || '',
        photo: record.photo_c || '',
        scienceMarks: record.science_marks_c || '',
        parentContact: {
          name: record.parent_contact_name_c || '',
          email: record.parent_contact_email_c || '',
          phone: record.parent_contact_phone_c || ''
        }
      };
    } catch (error) {
      console.error(`Error fetching student ${id}:`, error);
      return null;
    }
  }

  async create(studentData) {
    try {
      const params = {
        records: [{
Name: studentData.name,
          id_c: studentData.id,
          name_c: studentData.name,
          email_c: studentData.email,
          phone_c: studentData.phone,
          enrollment_date_c: studentData.enrollmentDate,
          photo_c: studentData.photo || '',
          parent_contact_name_c: studentData.parentContact?.name || '',
          parent_contact_email_c: studentData.parentContact?.email || '',
          parent_contact_phone_c: studentData.parentContact?.phone || '',
          class_id_c: studentData.classId ? parseInt(studentData.classId) : null,
          science_marks_c: studentData.scienceMarks || ''
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
      console.error("Error creating student:", error);
      toast.error("Failed to create student");
      return null;
    }
  }

  async update(id, studentData) {
    try {
      const params = {
        records: [{
          Id: parseInt(id),
          Name: studentData.name,
id_c: studentData.id,
          name_c: studentData.name,
          email_c: studentData.email,
          phone_c: studentData.phone,
          enrollment_date_c: studentData.enrollmentDate,
          photo_c: studentData.photo || '',
          parent_contact_name_c: studentData.parentContact?.name || '',
          parent_contact_email_c: studentData.parentContact?.email || '',
          parent_contact_phone_c: studentData.parentContact?.phone || '',
          class_id_c: studentData.classId ? parseInt(studentData.classId) : null,
          science_marks_c: studentData.scienceMarks || ''
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
      console.error("Error updating student:", error);
      toast.error("Failed to update student");
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
      console.error("Error deleting student:", error);
      toast.error("Failed to delete student");
      return false;
    }
  }

transformRecord(record) {
    return {
      Id: record.Id,
      id: record.id_c || '',
      name: record.name_c || record.Name || '',
      email: record.email_c || '',
      phone: record.phone_c || '',
      classId: record.class_id_c?.Id || record.class_id_c,
      enrollmentDate: record.enrollment_date_c || '',
      photo: record.photo_c || '',
      scienceMarks: record.science_marks_c || '',
      parentContact: {
        name: record.parent_contact_name_c || '',
        email: record.parent_contact_email_c || '',
        phone: record.parent_contact_phone_c || ''
      }
    };
  }
}

export default new StudentService();