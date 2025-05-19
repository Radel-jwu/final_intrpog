 export interface Workflow {
    id?: number;
    employeeId: number | string;
    
    type: string;
    details: string;
    status: string;
  }