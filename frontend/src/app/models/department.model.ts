export interface Department {
  dept_id?: number; // optional, for new departments
  name: string;
  description: string;
  employeeCount?: number; // optional, only shown in lists
}
