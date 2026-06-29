export interface IUser {
    id:string;
    name:string;
    role: "maintainer" | "contributor";
}
export interface Issue {
    id: string;
    title:string;
    description: string;
    type:"bug" | "feature_request";
    status:"open" | "in_progress" | "resolved";
    reporter_id: IUser;
}