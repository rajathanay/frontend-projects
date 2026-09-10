import {
    Component
} from '@angular/core';

import {
    Employee
} from './models/employee';

import {
    EmployeeForm
} from './components/employee-form/employee-form';

import {
    EmployeeList
} from './components/employee-list/employee-list';

@Component({
    selector: 'app-root',
    standalone: true,

    imports: [
        EmployeeForm,
        EmployeeList
    ],

    templateUrl: './app.html',
    styleUrl: './app.css'
})
export class App {

    selectedEmployee:
        Employee | null = null;

    refreshVersion = 0;

    startEdit(
        employee: Employee
    ): void {

        this.selectedEmployee = {
            ...employee
        };

        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }

    employeeSaved(): void {

        this.selectedEmployee =
            null;

        this.refreshVersion++;
    }

    cancelEdit(): void {

        this.selectedEmployee =
            null;
    }

    employeeDeleted(
        id: string | number
    ): void {

        if (
            this.selectedEmployee?.id
            === id
        ) {

            this.selectedEmployee =
                null;
        }
    }
}