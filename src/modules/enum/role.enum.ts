export enum Role {
    Manager = 'manager',
    Teacher = 'teacher',
    SubTeacher = 'sub_teacher',
    Student = 'student',
}

export const roles = {
    manager: [
            'view_users', 
            'view_cats',
            'view_crs', 
            'add_users_to_cat',
            'add_cat',
            'delete_users',         
            'delete_cat', 
            'update_users',
            'update_cat'
    ],
    teacher: [
        'view_users', 
        'view_cats',
        'view_crs',
        'create_class',
        'update_class',
        'delete_class'
    ],
    sub_teacher: [
        'view_users', 
        'view_cats',
        'view_crs',
        'create_class',
        'update_class',
        'delete_class'
    ],
    student: [
        'view_crs',
        'update_own_profile'
    ],
};