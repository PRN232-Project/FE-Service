export interface User {
  id: string;
  name: string;
  email: string;
  role: 'Student' | 'Examiner' | 'Admin';
  status: 'Active' | 'Inactive';
}

export const MOCK_USERS: User[] = Array.from({ length: 45 }, (_, i) => {
  let role: 'Student' | 'Examiner' | 'Admin' = 'Student';
  if (i === 0) role = 'Admin'; // User 0 is Admin
  else if (i % 10 === 0) role = 'Examiner'; // Users 10, 20, 30, 40 are Examiners

  return {
    id: role === 'Admin' ? 'ADMIN01' : (role === 'Examiner' ? `EX${1000 + i}` : `SE${123000 + i}`),
    name: ['Nguyen Van A', 'Tran Thi B', 'Le Van C', 'Pham D', 'Hoang E'][i % 5] + ` ${i}`,
    email: `user${i}@fpt.edu.vn`,
    role,
    status: i % 8 === 0 && role !== 'Admin' ? 'Inactive' : 'Active',
  };
});
