import {
    Component,
    EventEmitter,
    Input,
    OnChanges,
    Output,
    SimpleChanges
} from '@angular/core';

import {
    FormBuilder,
    FormGroup,
    ReactiveFormsModule,
    Validators
} from '@angular/forms';

import {
    Employee
} from '../../models/employee';

import {
    EmployeeService
} from '../../services/employee.service';

@Component({
    selector: 'app-employee-form',
    standalone: true,

    imports: [
        ReactiveFormsModule
    ],

    templateUrl: './employee-form.html',
    styleUrl: './employee-form.css'
})
export class EmployeeForm
    implements OnChanges {

    @Input()
    employee:
        Employee | null = null;

    @Output()
    saved =
        new EventEmitter<void>();

    @Output()
    cancelled =
        new EventEmitter<void>();

    form: FormGroup;

    saving = false;

    errorMessage = '';

    constructor(
        private formBuilder: FormBuilder,
        private employeeService:
            EmployeeService
    ) {

        this.form =
            this.formBuilder.group({

                firstName: [
                    '',
                    [
                        Validators.required,
                        Validators.minLength(2)
                    ]
                ],

                lastName: [
                    '',
                    [
                        Validators.required,
                        Validators.minLength(2)
                    ]
                ],

                email: [
                    '',
                    [
                        Validators.required,
                        Validators.email
                    ]
                ],

                department: [
                    '',
                    Validators.required
                ],

                role: [
                    '',
                    Validators.required
                ]
            });
    }

    ngOnChanges(
        changes: SimpleChanges
    ): void {

        if (
            !changes['employee']
        ) {
            return;
        }

        if (this.employee) {

            this.form.patchValue({

                firstName:
                    this.employee.firstName,

                lastName:
                    this.employee.lastName,

                email:
                    this.employee.email,

                department:
                    this.employee.department,

                role:
                    this.employee.role
            });

        } else {

            this.resetForm();
        }
    }

    submit(): void {

        this.errorMessage = '';

        if (
            this.form.invalid
        ) {

            this.form.markAllAsTouched();

            return;
        }

        this.saving = true;

        const value =
            this.form.getRawValue();

        const employeeData:
            Employee = {

            firstName:
                value.firstName.trim(),

            lastName:
                value.lastName.trim(),

            email:
                value.email.trim(),

            department:
                value.department.trim(),

            role:
                value.role.trim()
        };


        if (
            this.employee?.id
            !== undefined
        ) {

            employeeData.id =
                this.employee.id;

            this.employeeService
                .updateEmployee(
                    employeeData
                )
                .subscribe({

                    next: () => {
                        this.finishSave();
                    },

                    error: () => {
                        this.saveFailed();
                    }
                });

            return;
        }


        this.employeeService
            .addEmployee(
                employeeData
            )
            .subscribe({

                next: () => {
                    this.finishSave();
                },

                error: () => {
                    this.saveFailed();
                }
            });
    }

    cancelEdit(): void {

        this.resetForm();

        this.cancelled.emit();
    }

    isInvalid(
        controlName: string
    ): boolean {

        const control =
            this.form.get(
                controlName
            );

        return Boolean(
            control
            &&
            control.invalid
            &&
            control.touched
        );
    }

    private finishSave(): void {

        this.saving = false;

        this.resetForm();

        this.saved.emit();
    }

    private saveFailed(): void {

        this.saving = false;

        this.errorMessage =
            'Unable to save employee. Make sure JSON Server is running.';
    }

    private resetForm(): void {

        this.form.reset();

        this.errorMessage = '';

        this.saving = false;
    }
}