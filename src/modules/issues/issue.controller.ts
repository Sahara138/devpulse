import type { Request, Response } from "express";
import sendResponse from "../../utility/sendResponse";
import { issueService } from "./issue.service";

const createIssue = async(req:Request, res:Response)=> {
    try{
       const result = await issueService.createIssueIntoDB({
  ...req.body,
  reporter_id: req.user!.id,
});

    
        sendResponse(res,{
            statusCode: 201,
            success : true,
            message : "Issue created successfully!",
            data : result.rows[0],
        })
        

    }catch(error: any){
          sendResponse(res,{
            statusCode: 500,
            success: false,
            message: error.message,
            error: error
        })
    }
}

const getAllIssues = async (req: Request, res: Response) => {
  try {
    const result = await issueService.getAllIssueFromDB({
      sort: req.query.sort as string,
      type: req.query.type as string,
      status: req.query.status as string,
    });

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Issues retrieved successfully",
      data: result.rows,
    });
  } catch (error: any) {
    sendResponse(res, {
      statusCode: 500,
      success: false,
      message: error.message,
    });
  }
}

const getSingleIssue = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;

    const result = await issueService.getSingleIssueFromDB(id as string);
     if(result.rowCount === 0){
        return sendResponse(res,{
            statusCode:404,
            success:false,
            message:"User not found!",
            data: {}
        })
        
    }
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Issue retrieved successfully",
      data: result.rows[0],
    });
  } catch (error: any) {
    sendResponse(res, {
      statusCode: 500,
      success: false,
      message: error.message,
    });
  }
};

const updateIssue = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Get existing issue
    const issue = await issueService.getSingleIssueFromDB(id as string);

    if (issue.rowCount === 0) {
      return sendResponse(res, {
        statusCode: 404,
        success: false,
        message: "Issue not found!",
        data: {},
      });
    }

    const existingIssue = issue.rows[0];

    if (
      req.user!.role === "contributor" &&
      existingIssue.reporter_id !== req.user!.id
    ) {
      return sendResponse(res, {
        statusCode: 403,
        success: false,
        message: "You can only update your own issues.",
      });
    }

    if (
      req.user!.role === "contributor" &&
      req.body.status !== undefined
    ) {
      return sendResponse(res, {
        statusCode: 403,
        success: false,
        message: "Contributors cannot change issue status.",
      });
    }

    const result = await issueService.updateIssueIntoDB(id as string, req.body);

    return sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Issue updated successfully",
      data: result.rows[0],
    });
  } catch (error: any) {
    return sendResponse(res, {
      statusCode: 500,
      success: false,
      message: error.message,
    });
  }
};

const deleteIssue = async(req: Request, res:Response)=> {
    const {id} = req.params;
    try{
       const result = await issueService.deleteIssueIntoDB(id as string)
           if(result.rowCount === 0){
                return sendResponse(res,{
                    statusCode:404,
                    success:false,
                    message:"Issue not found!",
                    data: {}
                })
                
            }
            res.status(200).json({
                success: true,
                message:"Issue deleted successfully!",
                // data: result.rows[0]
                data: {}
            })
    }catch(error:any){
         res.status(500).json({
            success:false,
            message:error.message,
            error:error
        })
    }
}

export const issueController = {
    createIssue,
    getAllIssues,
    getSingleIssue,
    updateIssue,
    deleteIssue
}