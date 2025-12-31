/**
 * WAHA Plus Module
 * This is a wrapper around Core module that enables all Plus features
 * by removing limitations and enabling multi-session support
 */

// Simply re-export the Core module as Plus
// All limitations have been removed from Core
export { AppModuleCore as AppModulePlus } from '../core/app.module.core';
