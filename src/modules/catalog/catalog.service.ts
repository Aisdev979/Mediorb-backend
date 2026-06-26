import { Specialty } from '../../models/specialty.model';
import { Hospital } from '../../models/hospital.model';
import { Department } from '../../models/department.model';
import { User } from '../../models/user.model';

export const listSpecialties = () => Specialty.find().sort({ name: 1 });
export const listHospitals = () => Hospital.find().sort({ name: 1 });
export const listDepartments = (hospitalId: string) =>
  Department.find({ hospital: hospitalId }).sort({ name: 1 });

// Doctors available for a PMV to start a teleconsultation with.
export const listDoctors = () =>
  User.find({ role: 'DOCTOR' }).select('firstName lastName doctorProfile').sort({ firstName: 1 });
