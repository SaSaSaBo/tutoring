// import { Repository } from 'typeorm';
// import { UserCrEntity } from './user.cr.entity';

// export class UserCrRepository extends Repository<UserCrEntity> {
//     async findByUserAndClassroom(userId: number, classroomId: number): Promise<UserCrEntity | undefined> {
//         return this.findOne({ where: { userId, classroomId } });
//     }

//     async findClassroomsByUser(userId: number): Promise<UserCrEntity[]> {
//         return this.find({ where: { userId } });
//     }

//     async findStudentsByClassroom(classroomId: number): Promise<UserCrEntity[]> {
//         return this.find({ where: { classroomId } });
//     }

//     async addStudentToClassroom(userId: number, classroomId: number, addedBy: number): Promise<UserCrEntity> {
//         const userCr = this.create({
//             userId,
//             classroomId,
//             addedBy,
//         });
//         return this.save(userCr);
//     }

//     async removeStudentFromClassroom(userId: number, classroomId: number): Promise<void> {
//         await this.delete({ userId, classroomId });
//     }

//     async updateStudentClassroom(userId: number, classroomId: number, addedBy: number): Promise<UserCrEntity> {
//         const userCr = await this.findByUserAndClassroom(userId, classroomId);
//         if (!userCr) {
//             throw new Error('Record not found');
//         }
//         userCr.addedBy = addedBy;
//         return this.save(userCr);
//     }
// }
