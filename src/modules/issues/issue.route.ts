import { Router } from "express";
import { issueController } from "./issue.controller";
import auth from "../../middleware/auth";
import { USER_ROLE } from "../../types";

const router = Router();

router.post('/',auth(USER_ROLE.CONTRIBUTOR,USER_ROLE.MAINTAINER),issueController.createIssue)
router.get('/',auth(USER_ROLE.CONTRIBUTOR,USER_ROLE.MAINTAINER),issueController.getAllIssues)
router.get('/:id',auth(USER_ROLE.CONTRIBUTOR,USER_ROLE.MAINTAINER),issueController.getSingleIssue)
router.patch('/:id',auth(USER_ROLE.CONTRIBUTOR,USER_ROLE.MAINTAINER),issueController.updateIssue)
router.delete('/:delete',auth(USER_ROLE.MAINTAINER),issueController.deleteIssue)

export const issueRoute = router;