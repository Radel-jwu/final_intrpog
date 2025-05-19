import { Routes } from '@angular/router';
import { WorkflowComponent } from './components/workflow/workflow.component';
import { AddReqComponent } from './components/add-req/add-req.component';
import { LoginComponent } from './components/login/login.component';
import { authGuard } from './guards/auth.guard';
import { adminGuard } from './guards/admin.guard';
import { DepartmentsComponent } from './components/departments/departments.component';
import { RequestsComponent } from './requests/requests.component';
import { AccountsComponent } from './components/accounts/accounts.component';
import { AddAccComponent } from './components/add-acc/add-acc.component';
import { AddEmpComponent } from './components/add-emp/add-emp.component';
import { AddDeptComponent } from './components/add-dept/add-dept.component';
import { EmployeesComponent } from './components/employees/employees.component';

export const routes: Routes = [
  // Public routes
  { path: 'login', component: LoginComponent },
  
  // Protected routes
  { 
    path: '', 
    canActivate: [authGuard],
    children: [
      // Regular user routes - using WorkflowComponent as placeholder

      //Accounts routes
      { path: 'accounts', component: AccountsComponent },
      {path: 'add-acc', component: AddAccComponent},
      {path: 'edit-acc/:id', component: AddAccComponent},

      //Employees routes
      { path: 'employees', component: EmployeesComponent },
      { path: 'add-emp', component: AddEmpComponent },
      { path: 'edit-emp/:id', component: AddEmpComponent },


      //Departments routes  
      { path: 'departments', component: DepartmentsComponent },
      { path: 'add-dept', component: AddDeptComponent },
      { path: 'edit-dept/:id', component: AddDeptComponent },

      //Requests routes
      { path: 'requests', component: RequestsComponent },
      { path: 'add-req', component: AddReqComponent },
      { path: 'edit-req/:id', component: AddReqComponent },

      // Workflow routes
      { path: 'workflows', component: WorkflowComponent },
      { path: 'workflows/add', component: AddReqComponent },
      { path: 'workflows/:id', component: WorkflowComponent },

      
      
      
      // Admin-only routes
      { 
        path: 'accounts', 
        canActivate: [adminGuard],
        component: AccountsComponent // Using WorkflowComponent as a temporary placeholder
      },
      
      // Default route
      { path: '', redirectTo: 'accounts', pathMatch: 'full' }
    ]
  },
  
  // Fallback route
  { path: '**', redirectTo: 'login' }
]; 