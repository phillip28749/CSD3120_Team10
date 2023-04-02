/*!*****************************************************************************
\file	index-ext.ts
/*!*****************************************************************************
\brief
	This file sets up the extension to create.
*******************************************************************************/

import { createEntryPoint } from "./init";

window["extension"] = { createEntryPoint: createEntryPoint };
