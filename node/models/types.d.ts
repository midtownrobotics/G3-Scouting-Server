import { Optional } from "sequelize";
import { Assignment, NextMatch, Status } from "../types";

export interface User {
    id: number;
    username: string;
    password: string;
    permissionId: number;
    assignments?: Assignment[];
    assignedAlliance: "blue" | "red";
    nextMatch?: NextMatch;
    lastMatchScouted?: number;
    assignedMatches: number[];
}

export interface UserCreationAttributes extends Optional<User, 'id'> { }

export interface Response {
    id: number;
    matchNum: string;
    teamNum: string;
    autoL1: string;
    autoL2: string;
    autoL3: string;
    autoL4: string;
    matchL1: string;
    matchL2: string;
    matchL3: string;
    matchL4: string;
    barge: string;
    processor: string;
    climb: string;
    additionalNotes: string;
    timestamp: string;
    scoutId: string;
    scout: string;
}

export interface ResponseCreationAttributes extends Optional<Response, 'id'> { }