export interface IStep{
    id:number,
    photo:string,
    current:boolean,
    approvalRequestId:number,
    approverName:string,
    approverRole:string,
    approverEmail:string,
    stepOrder:number,
    status:string,
    actionDate:string,
    comments:string
    approverId: number,
}