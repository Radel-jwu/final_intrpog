export interface Employee {
  emp_id?: number;
  acc_id:  number; 
  email: string;
  dept_id:  number; 
  department: string;
  position: string;      // lowercase to match form
  hire_date: Date;
  status: string;
}
