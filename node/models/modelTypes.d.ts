export interface Match {
    id: number;
    userId: number;
    number: number;
    station: Station;
    alliance: "blue" | "red";
    team: number;
    highPriority: boolean;
    scouted: boolean;
    formId: number;
}

export interface MatchCreationAttributes extends Optional<Match, 'id'> {}

export interface Schedule {
    id: number;
    userId: number;
    matchesOn: number[];
    matchesOff: number[];
}

export interface ScheduleCreationAttributes extends Optional<Schedule, 'id'> {}

export interface User {
    id: number;
    username: string;
    password: string;
    permissionId: number;
    matches?: MatchModel;
    schedule?: ScheduleModel;
    assignedAlliance?: "blue" | "red";
    group?: number;
}

export interface UserCreationAttributes extends Optional<User, 'id'> { }