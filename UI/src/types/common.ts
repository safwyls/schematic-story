import dayjs from "dayjs";

export interface User {
    userName: string,
    email: string,
    timezone: dayjs.DayjsTimezone,
    avatarUrl: string
}

export interface SchematicProps {
    id: string | undefined
}

export interface Details {
    title: string,
    author: string,
    contributors: string[],
    buildSize: string,
    submittedAt: string,
    updatedAt: string,
    follows: number,
    downloads: number,
    description: any[],
    tags: string[],
    dimensions: Vec3d,
    fileSize: number
}

export interface Vec3d {
    x: number,
    y: number,
    z: number
}