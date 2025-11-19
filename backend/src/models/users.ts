import usersData from "../mocks/users.json";
import type { User } from "../types/User";
const users: User[] = usersData.map((u) => ({
    _id: u._id,
    username: u.username,
    password: u.password,
    email: u.email,
    subscription_date: u.subscription_date
        ? new Date(u.subscription_date)
        : new Date(),
}));

export function getAllUsers(): User[] {
    return users;
}

export function getUserById(_id: string): User | undefined {
    return users.find((user) => user._id === _id);
}

export function filterUserByName(name: string): User[] {
    return users.filter((user) => user.username.includes(name));
}

export function createUser(body: any): User {
    let user: User = {
        _id: body.user_id,
        username: body.username,
        password: body.password,
        email: body.email,
        subscription_date: new Date(body.subscription_date),
    };

    users.push(user);
    return user;
}

export function updateUserName(id: string, name: string) {
    let user = getUserById(id);
    if (user) {
        user.username = name;
    }
}

export function deleteUser(_id: string) {
    const index = users.findIndex((user) => user._id === _id);
    users.splice(index, 1);
}
