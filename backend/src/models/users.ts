import type { User } from "../types/User";
import usersData from "../mocks/users.json";
const users: User[] = usersData.map(u => ({...u}));



export function getAllUsers(): User[] {
    return users;
}

export function getUserById(_id: string): User | undefined {
    return users.find(user => user._id === _id);
} 

export function filterUserByName(name: string): User[] {
    return users.filter(user => user.name.includes(name));
}

export function createUser(_id: string, name: string): User {
    let user: User = {
        _id,
        name
    };

    users.push(user);
    return user;
}

export function updateUserName(id: string, name: string) {
    let user = getUserById(id);
    if (user) {user.name = name;}
}

export function deleteUser(_id: string) {
    const index = users.findIndex(user => user._id === _id);
    users.splice(index, 1);
}