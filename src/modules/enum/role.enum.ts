export enum Role {
    Manager = 'manager',
    Teacher = 'teacher',
    Student = 'student',
}

export const roles = {
    manager: [
            'view_users', 
            'view_cats', 
            'add_users_to_cat',
            'add_cat',
            'delete_users',         
            'delete_cat', 
            'update_users',
            'update_cat'
    ],
    teacher: [
        'view_users', 
        'view_cats'
    ],
    student: [
        'update_own_profile'
    ],
};