/*!*****************************************************************************
\file	index.ts
/*!*****************************************************************************
\brief
	This file contains the function to load the xr author data into the vr 
    application.
*******************************************************************************/

import { AuthoringData, loadAuthoringData } from "xrauthor-loader";
import { createEntryPoint } from "./init";

loadAuthoringData("assets/synthesis").then((data: AuthoringData) => {
  createEntryPoint("renderCanvas", data);
});
