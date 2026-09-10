import {
    Component,
    EventEmitter,
    Input,
    OnChanges,
    OnInit,
    Output,
    SimpleChanges
} from '@angular/core';

import {
    Employee
} from '../../models/employee';

import {
    EmployeeService
} from '../../services/employee.service';

@Component({
    selector: 'app-employee-list',
    standalone: true,

    imports: [],

    templateUrl: './employee-list.html',
    styleUrl: './employee-list.css'
})
export class EmployeeList
    implements OnInit, OnChanges {

    @Input()
    refreshVersion = 0;

    @Output()
    editRequested =
        new EventEmitter<Employee>();

    @Output()
    employeeDeleted =
        new EventEmitter<string | number>();

    employees:
        Employee[] = [];

    searchTerm = '';

    currentPage = 1;

    readonly pageSize = 5;

    loading = false;

    errorMessage = '';

    successMessage = '';

    constructor(
        private employeeService:
            EmployeeService
    ) {}

    ngOnInit(): void {

        this.loadEmployees();
    }

    ngOnChanges(
        changes: SimpleChanges
    ): void {

        if (
            changes['refreshVersion']
            &&
            !changes['refreshVersion']
                .firstChange
        ) {

            this.loadEmployees();
        }
    }

    get filteredEmployees():
        Employee[] {

        const term =
            this.searchTerm
                .trim()
                .toLowerCase();

        if (!term) {

            return this.employees;
        }

        return this.employees.filter(
            employee => {

                const text =
                    [
                        employee.firstName,
                        employee.lastName,
                        employee.email,
                        employee.department,
                        employee.role
                    ]
                    .join(' ')
                    .toLowerCase();

                return text.includes(
                    term
                );
            }
        );
    }

    get paginatedEmployees():
        Employee[] {

        const start =
            (this.currentPage - 1)
            * this.pageSize;

        return this.filteredEmployees
            .slice(
                start,
                start + this.pageSize
            );
    }

    get totalPages(): number {

        return Math.max(
            1,
            Math.ceil(
                this.filteredEmployees.length
                / this.pageSize
            )
        );
    }

    loadEmployees(): void {

        this.loading = true;

        this.errorMessage = '';

        this.employeeService
            .getEmployees()
            .subscribe({

                next: employees => {

                    this.employees =
                        employees;

                    if (
                        this.currentPage
                        > this.totalPages
                    ) {

                        this.currentPage =
                            this.totalPages;
                    }
                },

                error: () => {

                    this.loading = false;

                    this.errorMessage =
                        'Unable to load employees. Make sure JSON Server is running.';
                },

                complete: () => {

                    this.loading =
                        false;
                }
            });
    }

    onSearch(event: Event): void {

    this.searchTerm =
        (event.target as HTMLInputElement).value;

    this.currentPage = 1;
}

    editEmployee(
        employee: Employee
    ): void {

        this.editRequested.emit(
            employee
        );
    }

    deleteEmployee(
        employee: Employee
    ): void {

        if (
            employee.id ===
            undefined
        ) {
            return;
        }

        const confirmed =
            confirm(
                `Delete ${employee.firstName} ${employee.lastName}?`
            );

        if (!confirmed) {
            return;
        }

        this.errorMessage = '';
        this.successMessage = '';

        this.employeeService
            .deleteEmployee(
                employee.id
            )
            .subscribe({

                next: () => {

                    this.employees =
                        this.employees.filter(
                            current =>
                                current.id
                                !== employee.id
                        );

                    if (
                        this.currentPage
                        > this.totalPages
                    ) {

                        this.currentPage =
                            this.totalPages;
                    }

                    this.successMessage =
                        'Employee deleted successfully.';

                    this.employeeDeleted.emit(
                        employee.id!
                    );
                },

                error: () => {

                    this.errorMessage =
                        'Unable to delete employee.';
                }
            });
    }

    previousPage(): void {

        if (
            this.currentPage > 1
        ) {

            this.currentPage--;
        }
    }

    nextPage(): void {

        if (
            this.currentPage
            < this.totalPages
        ) {

            this.currentPage++;
        }
    }
}