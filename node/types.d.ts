export type Settings = {
    eventKey: string;
    permissionLevels: Array<Permission>;
}

type Permission = {
    name: string;
    blacklist: Array<string>;
}

type EditUserFieldData = {
    name: string;
    field: "username" | "password" | "permissionId";
    updated: string;
};

export type AdminPostRequest =
    | {
        action: "editUserField";
        data: {
            id: nubmer;
            field: "username" | "password" | "permissionId";
            updated: string;
        }
    }
    | {
        action: "addUser";
        data: {
            username: string;
            password: string;
            permissionId: number;
        }
    }
    | { action: "deleteUser"; data: number }
    | {
        action: "addPerm";
        data: {
            name: string, blacklist: string[]
        }
    }
    | { action: "changeKey"; data: string }
    | { action: "saveForm"; name: string; data: any }
    | { action: "deleteForm"; name: string }
    | { action: "overwriteForm"; name: string; data: any }
    | { action: "deployForm"; name: string; data: any };

export type AdminPostResponse = "OK" | "Bad User" | "Invalid Request";

export type GeneralPostRequest = {
    action: "getKey"
};

export type GeneralPostResponse = "Invalid Request" | {
    key: string
};

export type Station = "blue1" | "blue2" | "blue3" | "red1" | "red2" | "red3";

export type Alliance = "blue" | "red";

export type UserGetData = {
    name: string,
    nextMatch: {
        number: number,
        team: number | undefined,
        station: Station | undefined,
        highPriority: boolean | undefined
    },
    matches: MatchModel[]
}